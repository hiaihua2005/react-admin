import React, {Component} from 'react';
import {Form} from 'antd';
import {FormElement, FormRow, IconPicker, ModalContent} from 'src/library/components';
import config from 'src/commons/config-hoc';

@config({
    ajax: true,
    modal: {
        width: 700,
        title: props => {
            const {data = {}} = props;
            const {menuId, menuType} = data;
            const isMenu = menuType === 'C';

            if (isMenu) return menuId ? '编辑菜单' : '添加菜单';

            return menuId ? '编辑功能' : '添加功能';
        },
    },
})
export default class EditModal extends Component {
    state = {
        loading: false,
        iconVisible: false,
        visible:false,
    };

    componentDidMount() {
        const {isEdit} = this.props;
        const {key} = this.props.data;
        if (isEdit) {
            this.fetchData();
        }else {
            let menuInfo = {parentId:key};
            this.setState({data: menuInfo});
            this.form.setFieldsValue(menuInfo);
        }
    }


    fetchData = () => {
        if (this.state.loading) return;
        const {key,parentKey} = this.props.data;
        debugger;
        this.setState({loading: true});
        this.props.ajax.post(`/biz/menu/info/${key}`)
            .then(res => {
                if(res.code==0) {
                    let menuInfo = res.data;
                    this.setState({data: menuInfo});
                    this.form.setFieldsValue(menuInfo);
                }
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {parentKey} = this.props.data;

        console.log('Received values of form: ', values);
        let {isEdit} = this.props;
        // 如果key存在视为修改，其他为添加
        const {menuId} = values;
        if(menuId) {
            isEdit = true;
        }
        const {onOk} = this.props;
        const ajaxUrl = isEdit ? '/biz/menu/edit' : '/biz/menu/add';
        // TODO
        this.setState({loading: true});
        this.props.ajax.post(ajaxUrl,values)
            .then(res => {
                if(res.code==0) {
                    this.setState({visible: false});
                    onOk && onOk();
                }
            })
            .finally(() => this.setState({loading: false}));
    };

    handleCancel = () => {
        const {onCancel} = this.props;
        if (onCancel) onCancel();
    };

    render() {
        const {data} = this.props;
        const {loading} = this.state;
        const {menuType} = data;
        const isMenu = menuType === 'C';
        const visible = true;

        const formProps = {
            labelWidth: 70,
        };
        return (
            <ModalContent
                surplusSpace={false}
                loading={loading}
                visible={visible}
                okText="保存"
                onOk={() => this.form.submit()}
                cancelText="取消"
                onCancel={() =>this.props.onCancel() }
                onReset={() => this.form.resetFields()}
                resetText="重置"

            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    style={{padding: 16}}
                    initialValues={data}
                >
                    <FormElement {...formProps} type="hidden" name="menuId"/>
                    <FormElement {...formProps} type="hidden" name="parentId"/>
                    <FormElement {...formProps} type="hidden" name="menuType"/>
                    <FormRow>
                        <FormElement
                            {...formProps}
                            label="名称"
                            name="menuName"
                            required
                        />
                            <FormElement
                                {...formProps}
                                label="图标"
                                name="icon"
                            >
                                <IconPicker/>
                            </FormElement>
                            <FormElement
                                {...formProps}
                                label="编码"
                                name="perms"
                                required
                                labelTip="唯一标识，硬编码，前端一般会用于控制按钮是否显示。"
                            />
                    </FormRow>
                    <FormRow>
                        <FormElement
                            {...formProps}
                            label="路径"
                            name="url"
                            labelTip="菜单对应的页面地址，或者功能对应的页面地址。前端会基于用户所拥有的path，对路由进行过滤。"
                        />
                            <FormElement
                                {...formProps}
                                label="排序"
                                type="number"
                                name="orderNum"
                                min={0}
                                step={1}
                            />
                    </FormRow>
                    {isMenu ? (
                        <FormRow>
                            <FormElement
                                {...formProps}
                                type="select"
                                label="target"
                                name="target"
                                options={[
                                    {value: '', label: '项目内部窗口'},
                                    {value: '_self', label: '替换当前窗口'},
                                    {value: '_blank', label: '打开新窗口'},
                                ]}
                            />
                        </FormRow>
                    ) : null}
                </Form>
            </ModalContent>
        );
    }
}
