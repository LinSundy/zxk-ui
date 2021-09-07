[TOC]
# 学习记录

> 如果不是为了在当前项目写查看示例，那么本项目也无需引入以下loader，只需要简单的将已经写好的文件导出去就可以了，因为在项目中一定会解析Vue的文件, 并且也无需引入webpack。

> 本项目既做ui包，也需要让用户跑在本地去开发组件。所以嵌入了Vue的各种loader，原本想master分支去只做ui组件的导出，development分支来做组件的开发，但不知道方案是否可行。[TODO: 未进行试验]

> 对调用此组件的项目有一定要求：
    1. 必须使用babel处理es6的语法
    2. 必须可以解析Vue的文件
    3. 必须支持less的解析

1. `vue-loader` 解析vue文件
    - `new VueLoaderPlugin()` 这个是必须要引入的, 作用是按让对应的Vue中的各个模块也遵循 js、css等loader的规则

2. `babel-loader` 
    - https://webpack.docschina.org/loaders/babel-loader/

3. `less-loader`
    - https://webpack.docschina.org/loaders/less-loader/


> 在多个项目联调的过程中，使用npm link去操作, 注意mac下需要用到`sudo`命令

1. cd到模块目录，npm link，进行全局link
2. cd到项目目录，npm link 模块名(package.json中的name)

- 可以单独将项目的link解除，保留模块的全局link

3. 解除项目和模块link，项目目录下，npm unlink 模块名
4. 解除模块全局link，模块目录下，npm unlink 模块名