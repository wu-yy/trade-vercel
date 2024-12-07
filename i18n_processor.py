import os
import re
import json
from googletrans import Translator  # 使用 Google 翻译 API

# 定义路径
components_dir = "src/views"
zh_file = "src/language/locales/zh-CN.js"
en_file = "src/language/locales/en_US.js"

# 数字到英文单词的映射
number_to_word = {
    "0": "zero",
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine",
    "10": "ten",
    "11": "eleven",
    "12": "twelve",
    "13": "thirteen",
    "14": "fourteen",
    "15": "fifteen",
    "16": "sixteen",
    "17": "seventeen",
    "18": "eighteen",
    "19": "nineteen",
    "20": "twenty",
    "21": "twenty_one",
    "22": "twenty_two",
    "23": "twenty_three",
    "24": "twenty_four",
    "25": "twenty_five",
    "26": "twenty_six",
    "27": "twenty_seven",
    "28": "twenty_eight",
    "29": "twenty_nine",
    "30": "thirty",
    "31": "thirty_one",
    "32": "thirty_two",
    "33": "thirty_three",
    "34": "thirty_four",
    "35": "thirty_five",
    "36": "thirty_six",
    "37": "thirty_seven",
    "38": "thirty_eight",
    "39": "thirty_nine",
    "40": "forty",
    "41": "forty_one",
    "42": "forty_two",
    "43": "forty_three",
    "44": "forty_four",
    "45": "forty_five",
    "46": "forty_six",
    "47": "forty_seven",
    "48": "forty_eight",
    "49": "forty_nine",
    "50": "fifty",
    "51": "fifty_one",
    "52": "fifty_two",
    "53": "fifty_three",
    "54": "fifty_four",
    "55": "fifty_five",
    "56": "fifty_six",
    "57": "fifty_seven",
    "58": "fifty_eight",
    "59": "fifty_nine",
    "60": "sixty",
    "61": "sixty_one",
    "62": "sixty_two",
    "63": "sixty_three",
    "64": "sixty_four",
    "65": "sixty_five",
    "66": "sixty_six",
    "67": "sixty_seven",
    "68": "sixty_eight",
    "69": "sixty_nine",
    "70": "seventy",
    "71": "seventy_one",
    "72": "seventy_two",
    "73": "seventy_three",
    "74": "seventy_four",
    "75": "seventy_five",
    "76": "seventy_six",
    "77": "seventy_seven",
    "78": "seventy_eight",
    "79": "seventy_nine",
    "80": "eighty",
    "81": "eighty_one",
    "82": "eighty_two",
    "83": "eighty_three",
    "84": "eighty_four",
    "85": "eighty_five",
    "86": "eighty_six",
    "87": "eighty_seven",
    "88": "eighty_eight",
    "89": "eighty_nine",
    "90": "ninety",
    "91": "ninety_one",
    "92": "ninety_two",
    "93": "ninety_three",
    "94": "ninety_four",
    "95": "ninety_five",
    "96": "ninety_six",
    "97": "ninety_seven",
    "98": "ninety_eight",
    "99": "ninety_nine",
    "100": "one_hundred"
}

# 加载翻译文件：支持无引号键的 .js 文件
def load_translations(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        # 移除 export default 和尾随的分号
        content = re.sub(r"export\s+default\s+", "", content).strip().rstrip(";")
        # 使用正则表达式为没有引号的键补充双引号
        content = re.sub(r"(\w+):", r'"\1":', content)  # 匹配键名并添加双引号
        # 修复尾随逗号
        content = re.sub(r",\s*([\}\]])", r"\1", content)  # 移除对象和数组中的尾随逗号
        # 替换单引号为双引号
        content = re.sub(r"'([^']*)'", r'"\1"', content)  # 替换字符串中的单引号为双引号
        content = content.replace('\n', '').replace('\t', '')
        # 使用 json.loads 解析内容
        return json.loads(content)

# 保存翻译文件：保持原始格式
def save_translations(file_path, translations):
    json_content = json.dumps(translations, ensure_ascii=False, indent=4)
    # 将双引号的键转换回无引号格式
    formatted_content = re.sub(r'"(\w+)":', r'\1:', json_content)
    # 添加 export default
    content = "export default " + formatted_content + ";"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)


# 改进后的正则表达式：支持多行和跨标签文本
pattern = re.compile(r">[\s]*([\u4e00-\u9fa5a-zA-Z0-9，。？！：；、‘’“”""'《》]+)[\s]*<")

# 工具函数：根据文件名生成命名空间
def generate_namespace(filename):
    base_name = os.path.splitext(filename)[0]
    return base_name.lower().replace("-", "_")

# 将数字替换为英文单词
def replace_numeric_keys(key):
    pattern = re.compile(r"(\d+)(_?.*)")
    match = pattern.match(key)
    if match:
        number = match.group(1)
        rest_of_key = match.group(2)
        number_word = number_to_word.get(number, number)
        return f"{number_word}{rest_of_key}"
    return key

# 调用翻译工具翻译中文为英文
def translate_to_english(text):
    translator = Translator()
    translated = translator.translate(text, src="zh-cn", dest="en")
    return translated.text

# 优化翻译后的英文内容为更适合作为键名
def optimize_key_from_translation(text):
    text = re.sub(r"[^a-zA-Z0-9_]", "_", text).lower()
    text = replace_numeric_keys(text)
    return text


# 遍历主目录及其子目录中的所有 .vue 文件
for root, _, files in os.walk(components_dir):
    for file in files:
        if file.endswith(".vue"):

            zh_translations = load_translations(zh_file)
            en_translations = load_translations(en_file)
            
            file_path = os.path.join(root, file)
            namespace = generate_namespace(file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # 替换硬编码文本
            matches = pattern.findall(content)
            for match in matches:
                match = match.strip()
                # 跳过动态内容和空内容
                if not match or "{{" in match or "}}" in match or re.match(r"[\{\[].*[\}\]]", match):
                    continue

                # 翻译并优化英文内容
                match_trans = translate_to_english(match)
                processed_key = optimize_key_from_translation(match_trans)
                key = f"{namespace}.{processed_key}"
                content = re.sub(
                    rf">[\s]*{re.escape(match)}[\s]*<",
                    f">{{{{ $t('{key}') }}}}<",
                    content,
                )

                # 更新翻译文件
                zh_translations.setdefault(namespace, {})[processed_key] = match  # 保留中文
                en_translations.setdefault(namespace, {})[processed_key] = match_trans  # 使用翻译后的英文

            # 保存修改后的 VUE 文件
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
               
            # 保存更新后的翻译文件
            save_translations(zh_file, zh_translations)
            save_translations(en_file, en_translations)

print("国际化处理完成！")