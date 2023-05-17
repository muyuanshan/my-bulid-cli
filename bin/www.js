#! /usr/bin/env node 

const program = require('commander');

program
.command('create <app-name>') // 创建create命令。用户可以通过 my-cli create appName来创建项目
.description('create a new project') // 命名描述
.option('-f, --force', 'overwrite target if it exist') // 命令选项
.action((name, options) => {
  // 执行'./create.js',传入项目名称 和 用户选项
  require('./create')(name, options);
});

program.parse();