## Xlsx 对比工具

对比两个 .xlsx 文件的异同，并且用颜色显示

## 安装
```bash
npm i
```

## 编译 TS 文件
```bash
# 编译所有 *.ts 文件
tsc
# 或者持续编译
tsc -w
```

## 使用命令行对比
```bash
# xc 对比命令
# -s (-source) 需要对比的源文件(*.xlsx)路径
# -t (-target) 用于对比的目标文件(*.xlsx)路径
# -k (-key) 主键名
node ./bin/index.js xc -s test/a.xlsx -t test/b.xlsx -k A

# xc 查看帮助
node ./bin/index.js xc
```

# 更新日志

## 0.0.2
- 显示固定列功能
- 排除指定列功能
## 0.0.1 
- 基本对比功能
- 图示说明
- 新增行突出显示
- 删除行突出显示
- 不一样的单元格显示
- 主键突出显示
- 超长内容缩略显示
- 超长内容悬浮提示

