import React, { Component } from 'react';
import { Button, Form } from 'antd';
import PageContent from 'src/layouts/page-content';
import config from 'src/commons/config-hoc';
import {
    QueryBar,
    FormRow,
    FormElement,
    Table,
    Operator,
    Pagination,
} from 'src/library/components';
import batchDeleteConfirm from 'src/components/batch-delete-confirm';
import EditModal from './EditModal';

@config({
    path: '/system/users',
    ajax: true,
})
export default class UserCenter extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 20,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        visible: false,     // 添加、修改弹框
        userId: null,           // 需要修改的数据id
    };

    columns = [
        { title: '编码', dataIndex: 'userId', width: 200,visible:false },
        { title: '用户名', dataIndex: 'userName', width: 200 },
        { title: '年龄', dataIndex: 'age', width: 200 },
        { title: '工作', dataIndex: 'job', width: 200 },
        { title: '职位', dataIndex: 'position', width: 200 },
        {
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const { userId, name } = record;
                const items = [
                    {
                        label: '编辑',
                        onClick: () => this.setState({ visible: true, userId }),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${name}"?`,
                            onConfirm: () => this.handleDelete(userId),
                        },
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    componentDidMount() {
        this.handleSubmit();
    }

    handleSubmit = async () => {
        if (this.state.loading) return;

        const values = await this.form.validateFields();

        const { pageNum, pageSize } = this.state;
        const params = {
            ...values,
            pageNum,
            pageSize,
        };

        this.setState({ loading: true });
        this.props.ajax.post('/biz/user/list', params)
            .then(res => {
                const dataSource = res?.list || [];
                const total = res?.total || 0;

                this.setState({ dataSource, total });
            })
            .finally(() => this.setState({ loading: false }));
    };

    handleDelete = (userId) => {
        if (this.state.deleting) return;

        this.setState({ deleting: true });
        this.props.ajax.del(`/biz/user/remove/${userId}`, null, { successTip: '删除成功！', errorTip: '删除失败！' })
            .then(() => this.handleSubmit())
            .finally(() => this.setState({ deleting: false }));
    };

    handleBatchDelete = () => {
        if (this.state.deleting) return;

        const { selectedRowKeys } = this.state;
        batchDeleteConfirm(selectedRowKeys.length)
            .then(() => {
                this.setState({ deleting: true });
                this.props.ajax.del('/biz/user/batchRemove', { ids: selectedRowKeys }, { successTip: '删除成功！', errorTip: '删除失败！' })
                    .then(() => {
                        this.setState({ selectedRowKeys: [] });
                        this.handleSubmit();
                    })
                    .finally(() => this.setState({ deleting: false }));
            });
    };

    render() {
        const {
            loading,
            deleting,
            dataSource,
            selectedRowKeys,
            total,
            pageNum,
            pageSize,
            visible,
            userId,
        } = this.state;

        const formProps = {
            width: 200,
        };
        const disabledDelete = !selectedRowKeys?.length;
        return (
            <PageContent>
                <QueryBar>
                    <Form onFinish={() => this.setState({ pageNum: 1 }, () => this.handleSubmit())} ref={form => this.form = form}>
                        <FormRow>
                            <FormElement
                                {...formProps}
                                label="名称"
                                name="name"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="职位"
                                name="job"
                                options={[
                                    { value: 1, label: 1 },
                                    { value: 2, label: 2 },
                                ]}
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit">提交</Button>
                                <Button onClick={() => this.form.resetFields()}>重置</Button>
                                <Button type="primary" onClick={() => this.setState({ visible: true, id: null })}>添加</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchDelete}>删除</Button>
                            </FormElement>
                        </FormRow>
                    </Form>
                </QueryBar>

                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: selectedRowKeys => this.setState({ selectedRowKeys }),
                    }}
                    loading={loading}
                    columns={this.columns}
                    dataSource={dataSource}
                    rowKey="userId"
                    serialNumber
                    pageNum={pageNum}
                    pageSize={pageSize}
                />

                <Pagination
                    total={total}
                    pageNum={pageNum}
                    pageSize={pageSize}
                    onPageNumChange={pageNum => this.setState({ pageNum }, () => this.handleSubmit())}
                    onPageSizeChange={pageSize => this.setState({ pageSize, pageNum: 1 }, () => this.handleSubmit())}
                />

                <EditModal
                    visible={visible}
                    userId={userId}
                    isEdit={userId !== null}
                    onOk={() => this.setState({ visible: false }, () => this.handleSubmit())}
                    onCancel={() => this.setState({ visible: false })}
                />
            </PageContent>
        );
    }
}
