const path = require('path');
const fs = require('fs-extra');
// 引入ora工具 命令行loading 动效
const ora = require('ora');
const inquirer = require('inquirer');
// 引入download-git-repo工具
const downloadGitRepo = require('download-git-repo');
// download-git-repo 默认不支持异步调用，需要使用util插件的util.promisfy进行转换
const util = require('util');

//获取git项目列表
const { getRepolist } = require('./http');

async function wrapLoading(fn, message, ...args) {
  const spinner = ora(message);

  // 下载开始
  spinner.start();

  try {
    const result = await fn(...args);
    spinner.succeed();
  } catch (e) {
    // 下载失败
    spinner.fail('Request failed');
  }
}

// 创建项目类

class Generator {
  constructor (name, target, ask) {
    this.name = name;
    this.target = target;
    this.ask = ask;
    this.downloadGitRepo = util.promisify(downloadGitRepo)
  }
  
  async getRepo() {
    // 获取git仓库的项目列表
    const repolist = await wrapLoading(getRepolist, 'waiting fetch template...');
    if (!repolist) return
    const repos = repolist.map((item) => item.name);

    // 通过inquirer 让用户选择要下载的项目模版
    const { repo } = await inquirer.prompt({
      name: 'repo',
      typer: 'list',
      choices: repos,
      message: 'Please choose a template'
    });

    return repo;
  }

  // 下载用户选择的项目模版
  async download() {
    const requestUrl = `yuan-cli/${repo}`;
    await wrapLoading(
      this.downloadGitRepo,
      'wait download template',
      requestUrl,
      path.resolve(process.cwd(), this.target)
    );
  }

  // 文件入口，在create.js中 执行
  async create() {
    const repo = await this.getRepo();
    console.log('用户选择了', repo);

    // 下载用户选择的模版
    await this.download(repo);

    // 下载完成后， 获取项目里面的package.json
    // 将用户创建项目的填写信息（项目名称，作者名字，描述信息），写入到package.json里面
    let targetPath = path.resolve(process.cwd(), this.target);

    let jsonPath = path.join(targetPath, 'package.json');

    if (fs.existsSync(jsonPath)) {
      // 读取已下载模版中的package.json的内容
       const data = fs.readFileSync(jsonPath).toString();
       let json = JSON.parse(data);
       json.name = this.name;
       // 让用户输入的内容 替换到 package.json 中对应的字段
       Object.keys(this.ask).forEach((item) => {
        json[item] = this.ask[item];
       });
       fs.writeFileSync(jsonPath, JSON.stringify(json, null, '\t', 'utf-8'));
    }
  }

}

module.exports = Generator;
