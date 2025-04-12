import subprocess
import os
import json


if __name__ == "__main__":
    # 获取当前目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # 拼接 cmd.sh 的完整路径
    cmd_path = os.path.join(current_dir, 'cmd.sh')

    # 确保文件具有可执行权限
    subprocess.run(['chmod', '+x', cmd_path])

    # 显式调用 bash 执行脚本
    result = subprocess.run(['bash', cmd_path], capture_output=True, text=True)

    # 输出执行结果
    print(f"程序已运行: http://127.0.0.1:8080")
