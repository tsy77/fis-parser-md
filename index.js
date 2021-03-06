const hljs = require('highlight.js');
const marked = require('marked');

function buildHeadingTree(tokens) {
    if (!tokens) { return {}; }

    function addChildren(curNode) {
        curParentNode.children = curParentNode.children || [];
        curParentNode.children.push(curNode);
        curParentNode = lastParentNode[curNode.treeDepth] = curNode;
    }

    function findParentNode(curNode) {
        while (curNode.depth <= curParentNode.depth) {
            curParentNode = lastParentNode[curParentNode.treeDepth-1]
        }
    }

    function setTreeDepth(curNode) {
        curNode.treeDepth = curParentNode.treeDepth + 1;
    }

    function handleCurNode(curNode) {
        findParentNode(curNode);
        setTreeDepth(curNode)
        addChildren(curNode);
    }


    let lastParentNode = [{
        depth: 0,
        treeDepth: 0
    }];
    let root = curParentNode = lastParentNode[0];

    for (let token of tokens) {

        if (token.type === 'heading') {
            const { depth, text } = token;
            let curNode = {
                text,
                depth,
            };

            handleCurNode(curNode);
        }
    }

    return root;
}

module.exports = function (content, file, conf) {
    marked.setOptions(conf);

    const tokens = marked.lexer(content)
    const headingTree = buildHeadingTree(tokens);
    let html = marked(content);

    if (conf.isHtmlParse) {
        html = fis.compile.partial(html, file, {
            ext: 'html',
            isHtmlLike: true
        });
    };

    return 'module.exports = ' + JSON.stringify({
        html,
        headingTree
    });
}

module.exports.defaultOptions = {
    highlight: function (code, lang) {
        if(lang && hljs.getLanguage(lang)){
            return hljs.highlight(lang, code, true).value;
        } else {
            return hljs.highlightAuto(code).value;
        }
    }
}