from flask import Flask, request, Response
from flask_cors import CORS  # 导入CORS

import json
import ollama


app = Flask(__name__)
CORS(app)  # 启用CORS支持

role = {
    'bot': 'assistant',
    'user': 'user'
}


def generate_stream_response_by_openai(messages=None, model='Qwen/QwQ-32B', base_url=None, api_key=None):
    from openai import OpenAI

    client = OpenAI(
        base_url=base_url,
        api_key=api_key,  # ModelScope Token
    )

    response = client.chat.completions.create(
        model=model,  # ModelScope Model-Id
        messages=messages,
        stream=True
    )
    for chunk in response:
        reasoning_chunk = chunk.choices[0].delta.reasoning_content  # delta.reasoning_content 是推理
        answer_chunk = chunk.choices[0].delta.content  # delta.content 是响应内容
        if reasoning_chunk != '':
            yield f"data: {json.dumps({'text': reasoning_chunk, 'reason': True}, ensure_ascii=False)}\n"
        elif answer_chunk != '':
            yield f"data: {json.dumps({'text': answer_chunk, 'reason': False}, ensure_ascii=False)}\n"

        yield ""  # 结束标记


def generate_stream_response_by_ollama(messages=None, model='qwen2'):
    response = ollama.chat(
        model=model,
        messages=messages,
        stream=True
    )
    for chunk in response:
        answer_chunk = chunk['message']['content']
        if answer_chunk != '':
            yield f"data: {json.dumps({'text': answer_chunk, 'reason': False}, ensure_ascii=False)}\n"
        yield ""  # 结束标记


@app.route('/stream_openai_generate', methods=['POST'])
def stream_generate_openai():
    print(request.json)
    # 获取请求中的输入数据
    data = request.json['messages']
    model = request.json['model']
    base_url = request.json['base_url']
    api_key = request.json['api_key']

    messages = []
    for line in data[1:]:
        messages.append({
            'role': role[line['sender']],
            'content': line['text']
        })
    print(messages)

    if base_url != 'Ollama':
        # 返回流式响应
        return Response(
            generate_stream_response_by_openai(
                messages=messages,
                model=model,
                base_url=base_url,
                api_key=api_key
            ),
            mimetype='text/event-stream',  # Server-Sent Events类型
            headers={
                'X-Accel-Buffering': 'no',  # 禁用Nginx缓存
                'Cache-Control': 'no-cache'
            }
        )
    else:
        # 返回流式响应
        return Response(
            generate_stream_response_by_ollama(
                messages=messages,
                model=model
            ),
            mimetype='text/event-stream',  # Server-Sent Events类型
            headers={
                'X-Accel-Buffering': 'no',  # 禁用Nginx缓存
                'Cache-Control': 'no-cache'
            }
        )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
