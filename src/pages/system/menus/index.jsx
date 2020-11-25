import React, {Component} from 'react';
import {Button} from 'antd';
import {Icon} from 'src/library/components';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import localMenus from '../../../menus';
import {convertToTree} from 'src/library/utils/tree-utils';
import {Table, ToolBar, Operator} from 'src/library/components';
import EditModal from './EditModal';
import './style.less';

@config({
    path: '/system/menus',
    title: {text: '菜单&权限', icon: 'lock'},
    ajax: true,
})
export default class index extends Component {
    state = {
        loading: false,
        menus: [],
        visible: false,
        record: {},
        iconVisible: false,
        menuId: null,           // 需要修改的数据id
    };

    columns = [
        {
            title: '名称', dataIndex: 'text', key: 'text', width: 300,
            render: (value, record) => {
                const {icon} = record;

                if (icon){
                    return <span><Icon type={icon}/> {value}</span>;
                }
                return value;
            },
        },
        {title: '路径', dataIndex: 'path', key: 'path'},
        {title: '打开方式', dataIndex: 'target', key: 'target', width: 60},
        {
            title: '类型', dataIndex: 'type', key: 'type', width: 60,
            render: value => {
                if (value === 'M') return '目录';
                if (value === 'C') return '菜单';
                if (value === 'F') return '功能';
                return '菜单';
            },
        },
        {title: '排序', dataIndex: 'order', key: 'order', width: 60},
        {
            title: '操作', dataIndex: 'operator', key: 'operator', width: 150,
            render: (value, record) => {
                // 要有type
                const {type = 'M',key} = record;
                const items = [
                    {
                        label: '编辑',
                        icon: 'form',
                        onClick: () => this.setState({data: {...record, menuType:type}, visible: true,menuId:key}),
                    },
                    {
                        label: '删除',
                        icon: 'delete',
                        color: 'red',
                        confirm: {
                            title: '您请确定要删除此节点及其子节点吗？',
                            onConfirm: () => this.handleDeleteNode(record),
                        },
                    },
                    {
                        label: '添加子菜单',
                        icon: 'folder-add',
                        onClick: () => this.setState({data: {...record,parentKey: record.parentKey, menuType: 'M'}, menuId:null,visible: true}),
                    },
                    {
                        label: '添加子功能',
                        icon: 'file-add',
                        onClick: () => this.setState({data: {...record,parentKey: record.parentKey, menuType: 'C'}, menuId:null,visible: true}),
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    componentDidMount() {
        this.handleSearch();
    }

    handleSearch() {
        this.props.ajax.post('/biz/menu/list').then(menus => {

            // 菜单根据order 排序
            // const orderedData = [...menus].sort((a, b) => {
            //     const aOrder = a.order || 0;
            //     const bOrder = b.order || 0;
            //
            //     // 如果order都不存在，根据 text 排序
            //     if (!aOrder && !bOrder) {
            //         return a.text > b.text ? 1 : -1;
            //     }
            //
            //     return bOrder - aOrder;
            // });
            // const menuTreeData = convertToTree(orderedData);
            // this.setState({menus: menuTreeData});
            let menuData =  (menus || []).map(item => (
                {key: ''+item.menuId, text:item.menuName,type:item.menuType,icon:item.icon,
                    path:item.url,parentKey: ''+item.parentId,order:item.orderNum}));
            console.log('menus--->');
            console.log(menus);
            const menuTreeData = convertToTree(menuData);
            console.log(menuTreeData);
            this.setState({menus:menuTreeData});
        });
        /*
        // TODO 获取所有的菜单，不区分用户
        this.setState({loading: true});
        this.props.ajax
            .get('/menus')
            .then(res => {
                this.setState({menus: res});
            })
            .finally(() => this.setState({loading: false}));
        */
    }

    handleAddTopMenu = () => {
        this.setState({data: {menuType: 'C',parentKey:0},isEdit:false, visible: true});
    };

    handleDeleteNode = (record) => {
        const {key} = record;
        // TODO
        this.setState({loading: true});
        this.props.ajax
            .post(`/biz/menu/remove/${key}`)
            .then(() => {
                this.setState({visible: false});
                this.handleSearch();
            })
            .finally(() => this.setState({loading: false}));
    };

    render() {
        const {
            menus,
            visible,
            loading,
            data,
            menuId,
        } = this.state;

        return (
            <PageContent styleName="root">
                <ToolBar>
                    <Button type="primary" onClick={this.handleAddTopMenu}>添加顶级</Button>
                </ToolBar>

                <Table
                    loading={loading}
                    columns={this.columns}
                    dataSource={menus}
                    pagination={false}
                />
                <EditModal
                    visible={visible}
                    data={data}
                    menuId={menuId}
                    isEdit={menuId !== null}
                    onOk={() => this.setState({visible: false}, this.handleSearch)}
                    onCancel={() => this.setState({ visible: false })}
                />
            </PageContent>
        );
    }
}

