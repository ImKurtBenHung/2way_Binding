class Complier {
    constructor(el, vm) {
        this.vm = vm;
        this.el = el;
        this.complie(this.el);
    }
    // 编译虚拟Dom
    complie(node) {
        let childNodes = node.childNodes;
        // 伪数组转真数组
        [...childNodes].forEach(node => {
            // 元素节点
            if (this.isElementNode(node)) {
                let elementNode = node;
                // 可能还有子节点
                this.complie(elementNode);
                this.complieElement(elementNode);
            } else {
                // 文本节点
                let textNode = node;
                this.complieText(textNode);
            }
        })
    }
    // 编译元素节点含有v-开头
    complieElement(elementNode) {
        let attributes = elementNode.attributes;
        [...attributes].forEach(attr => {
            let {
                name,
                value
            } = attr;
            if (name.startsWith('v-')) {
                var [, directive] = name.split('-');
                ComplieUtil[directive](elementNode,value,this.vm);
            }
        })
    }
    // 编译文本节点
    complieText(textNode) {
        var content = textNode.textContent;
        content.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            ComplieUtil['text'](textNode,args[1],this.vm);
        })
    }
   
    isElementNode(node){
        return  node.nodeType === 1;
    }
}
let ComplieUtil = {
    getVal(expr,vm){
        return expr.split('.').reduce((prev,curr)=>{
            return prev[curr]
        },vm.$data)
    },
    model(node,expr,vm){
        var value = this.getVal(expr,vm);
        this.updater['modelUpdate'](node,value);
    },
    html(node,expr,vm){
        var value = this.getVal(expr,vm);
        this.updater['htmlUpdate'](node,value);
    },
    text(node,expr,vm){
        var value = this.getVal(expr,vm);
        this.updater['textUpdate'](node,value);
    },
    updater:{
        modelUpdate(node,value){
            node.value = value;
        },
        htmlUpdate(node,value){
            node.innerHTML = value;
        },
        textUpdate(node,value){
            node.textContent = value;
        }
    }
}
class Vue {
    constructor(options) {
        this.$el = this.isElementNode(options.el) ? options.el : document.querySelector(options.el);
        this.$data = options.data;
        let fragment = this.node2Fragment(this.$el);
        new Complier(fragment,this);
        // 挂载到真实dom
        this.$el.appendChild(fragment);
    }
    // 判断是否是元素节点
    isElementNode(node) {
        return node.nodeType === 1;
    }
    // 转换成元素碎片（虚拟Dom）
    node2Fragment(node) {
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 一个个移走顶部的子节点
        while (firstChild = node.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
}