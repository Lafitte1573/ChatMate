import subprocess
import json


def kill_process_on_port(port):
    """
    查找并终止占用指定端口的进程
    """
    try:
        # 查找占用端口的进程
        result = subprocess.run(['lsof', '-i', f':{port}'], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"未找到占用端口 {port} 的进程")
            return

        # 解析输出，获取进程 ID
        lines = result.stdout.splitlines()
        if len(lines) <= 1:
            print(f"未找到占用端口 {port} 的进程")
            return

        # 提取进程 ID 并终止进程
        for line in lines[1:]:  # 跳过表头
            pid = line.split()[1]  # 第二列为进程 ID
            print(f"终止进程 {pid} (占用端口 {port})")
            subprocess.run(['kill', '-9', pid])

    except Exception as e:
        print(f"终止端口 {port} 的进程时出错: {e}")


def main():
    # 终止占用 8080 和 8000 端口的进程
    for port in [8080, 8000]:
        kill_process_on_port(port)


if __name__ == "__main__":
    main()
