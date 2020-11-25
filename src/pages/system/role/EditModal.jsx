import React, {Component} from 'react';
import {Form} from 'antd';
import {FormElement} from 'src/library/components';
import config from 'src/commons/config-hoc';
import {ModalContent} from 'src/library/components';

@config({
    ajax: true,
    modal: {
        title: props => props.isEdit ? '修改' : '添加',
    },
})
export default class EditModal extends Component {
    state = {
        loading: false,     // 页面加载loading
        data: {},           // 回显的角色数据
    };

    componentDidMount() {
        const {isEdit} = this.props;

        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;

        const {roleId} = this.props;

        this.setState({loading: true});
        this.props.ajax.post(`/biz/role/info/${roleId}`)
            .then(res => {
                if(res.code==0) {
                    this.setState({data: res.data || {}});
                    this.form.setFieldsValue(res.data);
                }
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = (values) => {
        if (this.state.loading) return;

        const {isEdit} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        const ajaxMethod = isEdit ? this.props.ajax.post : this.props.ajax.get;
        const ajaxUrl = isEdit ? '/biz/role/edit' : '/biz/role/add';

        this.setState({loading: true});
        this.props.ajax.post(ajaxUrl,values)
            .then(res => {
                if(res.code==0) {
                    // this.setState({data: res.data || {}});
                    // this.form.setFieldsValue(res.data);
                    const {onOk} = this.props;
                            onOk && onOk();
                }
            })
            .finally(() => this.setState({loading: false}));

        // ajaxMethod(ajaxUrl, values, {successTip})
        //     .then(() => {
        //         const {onOk} = this.props;
        //         onOk && onOk();
        //     })
        //     .finally(() => this.setState({loading: false}));
    };

    render() {
        const {isEdit} = this.props;
        const {loading, data} = this.state;
        const formProps = {
            labelWidth: 100,
        };
        return (
            <ModalContent
                loading={loading}
                okText="保存"
                cancelText="重置"
                resetText="重置"
                onOk={() => this.form.submit()}
                onReset={() => this.form.resetFields()}
                onCancel={() =>this.props.onCancel() }
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >
                    {isEdit ? <FormElement {...formProps} type="hidden" name="roleId"/> : null}
                    <FormElement
                        {...formProps}
                        label="角色名称"
                        name="roleName"
                        required
                    />
                    <FormElement
                        {...formProps}
                        label="角色Key"
                        name="roleKey"
                        required
                    />
                    <FormElement
                        {...formProps}
                        label="描述"
                        name="remark"
                    />
                </Form>
            </ModalContent>
        );
    }
}
