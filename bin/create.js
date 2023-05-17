const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const Generator = require('./generator');


module.exports = async function (name, options) {
  const cwd = process.cwd; // 获取当前路劲
  const targetAir = path.join(cwd, name);

  // 如果该目录已经存在
  if (fs.existsSync(targetAir)) {
    // 强制删除
    if (options.force) {
      await fs.remove(targetAir)
    } else {
      // 通过inquirer： 询问用户是否确定要覆盖 或者取消
      let { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target already exists',
          choices: [
            {
              name: 'overwrite',
              value: 'overwrite'
            },
            {
              name: 'cancel',
              value: false,
            }
          ]
        }
      ]);
      if (!action) {
        return;
      } else {
        // 删除文件夹
        await fs.remove(targetAir);
      }
    }
  }

  const args = require('./ask');

  // 通过inquirer, 让用户输入项目内容：作者和描述
  const ask = inquirer.prompt(args);
  // 创建项目
  const generator = new Generator(name, targetAir, ask);
  generator.create();
}