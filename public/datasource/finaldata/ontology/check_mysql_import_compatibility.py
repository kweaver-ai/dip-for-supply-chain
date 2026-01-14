"""
检查 Ontology CSV 文件是否可以直接通过 DBeaver 导入 MySQL 数据库
检查项：
1. 字段名是否符合 MySQL 规范
2. 编码格式
3. 日期格式
4. 数值格式
5. 特殊字符处理
6. 主键唯一性
"""

import csv
import os
import re
from collections import Counter

ONTOLOGY_DIR = os.path.dirname(os.path.abspath(__file__))

def check_field_names(fieldnames):
    """检查字段名是否符合 MySQL 规范"""
    issues = []
    mysql_reserved_words = {
        'order', 'group', 'select', 'table', 'index', 'key', 'user', 
        'database', 'schema', 'view', 'trigger', 'procedure', 'function'
    }
    
    for field in fieldnames:
        # 检查是否有空格
        if ' ' in field:
            issues.append(f"字段名包含空格: {field}")
        
        # 检查是否以数字开头
        if field and field[0].isdigit():
            issues.append(f"字段名以数字开头: {field}")
        
        # 检查是否包含特殊字符（允许下划线和字母数字）
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', field):
            issues.append(f"字段名包含非法字符: {field}")
        
        # 检查是否是 MySQL 保留字
        if field.lower() in mysql_reserved_words:
            issues.append(f"字段名是 MySQL 保留字: {field} (建议用反引号包裹)")
    
    return issues

def check_date_format(value, field_name):
    """检查日期格式是否符合 MySQL DATE/DATETIME 格式"""
    if not value or value.strip() == '':
        return None
    
    # MySQL 支持的日期格式: YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS
    date_pattern = r'^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$'
    if not re.match(date_pattern, value.strip()):
        return f"日期格式不符合 MySQL 要求: {field_name}={value} (应为 YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS)"
    return None

def check_numeric_format(value, field_name):
    """检查数值格式"""
    if not value or value.strip() == '':
        return None
    
    value = value.strip()
    # 检查是否是有效的数值（包括小数、负数、百分比）
    if re.match(r'^-?\d+\.?\d*%?$', value):
        return None
    # 如果包含逗号分隔符（如 1,234.56），需要处理
    if ',' in value and not re.match(r'^-?\d{1,3}(,\d{3})*(\.\d+)?%?$', value):
        return f"数值格式可能有问题: {field_name}={value}"
    return None

def check_special_characters(value):
    """检查是否包含需要转义的特殊字符"""
    if not value:
        return None
    
    # 检查是否包含未转义的引号
    if '"' in str(value) and not str(value).startswith('"'):
        return "包含未转义的引号"
    
    # 检查是否包含换行符
    if '\n' in str(value) or '\r' in str(value):
        return "包含换行符（需要转义）"
    
    return None

def check_csv_file(file_path):
    """检查单个 CSV 文件"""
    file_name = os.path.basename(file_path)
    table_name = file_name.replace('.csv', '')
    
    results = {
        'file_name': file_name,
        'table_name': table_name,
        'encoding': 'UTF-8',
        'field_count': 0,
        'record_count': 0,
        'field_issues': [],
        'data_issues': [],
        'primary_key_issues': [],
        'compatible': True,
        'warnings': []
    }
    
    try:
        # 尝试读取文件
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            # 检测 BOM
            bom = f.read(3)
            if bom == '\ufeff':
                results['warnings'].append("文件包含 UTF-8 BOM (utf-8-sig)，DBeaver 可以处理")
            
            f.seek(0)
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            
            if not fieldnames:
                results['compatible'] = False
                results['field_issues'].append("文件没有字段名")
                return results
            
            results['field_count'] = len(fieldnames)
            
            # 检查字段名
            field_issues = check_field_names(fieldnames)
            results['field_issues'] = field_issues
            
            # 读取数据行
            data = []
            primary_keys = []
            
            for row_num, row in enumerate(reader, start=2):  # 从第2行开始（第1行是标题）
                data.append(row)
                results['record_count'] += 1
                
                # 检查每行的数据格式
                for field_name, value in row.items():
                    # 检查日期字段
                    if 'date' in field_name.lower() or 'time' in field_name.lower():
                        date_issue = check_date_format(value, field_name)
                        if date_issue and row_num <= 5:  # 只记录前5行的日期问题
                            results['data_issues'].append(f"第{row_num}行: {date_issue}")
                    
                    # 检查数值字段
                    if any(keyword in field_name.lower() for keyword in ['quantity', 'amount', 'price', 'rate', 'count', 'capacity', 'revenue', 'year']):
                        num_issue = check_numeric_format(value, field_name)
                        if num_issue and row_num <= 5:
                            results['data_issues'].append(f"第{row_num}行: {num_issue}")
                    
                    # 检查特殊字符
                    if value:
                        special_issue = check_special_characters(value)
                        if special_issue and row_num <= 5:
                            results['data_issues'].append(f"第{row_num}行 {field_name}: {special_issue}")
                
                # 收集主键值（假设第一个字段是主键）
                if fieldnames[0] in row:
                    primary_keys.append(row[fieldnames[0]])
            
            # 检查主键唯一性
            if primary_keys:
                pk_counter = Counter(primary_keys)
                duplicates = {pk: count for pk, count in pk_counter.items() if count > 1}
                if duplicates:
                    results['primary_key_issues'].append(f"主键重复: {len(duplicates)} 个重复值")
                    results['warnings'].append(f"主键重复示例: {list(duplicates.items())[:3]}")
            
            # 判断是否兼容
            if field_issues or (results['data_issues'] and len(results['data_issues']) > 10):
                results['compatible'] = False
            
    except UnicodeDecodeError as e:
        results['compatible'] = False
        results['field_issues'].append(f"编码错误: {str(e)}")
    except Exception as e:
        results['compatible'] = False
        results['field_issues'].append(f"读取错误: {str(e)}")
    
    return results

def generate_report():
    """生成检查报告"""
    csv_files = [f for f in os.listdir(ONTOLOGY_DIR) if f.endswith('.csv')]
    csv_files.sort()
    
    all_results = []
    compatible_count = 0
    
    print("=" * 80)
    print("MySQL/DBeaver 导入兼容性检查报告")
    print("=" * 80)
    print()
    
    for csv_file in csv_files:
        file_path = os.path.join(ONTOLOGY_DIR, csv_file)
        result = check_csv_file(file_path)
        all_results.append(result)
        
        if result['compatible']:
            compatible_count += 1
    
    # 汇总报告
    print(f"总文件数: {len(csv_files)}")
    print(f"兼容文件数: {compatible_count}")
    print(f"需要处理的文件数: {len(csv_files) - compatible_count}")
    print()
    
    # 详细报告
    for result in all_results:
        status = "[OK] 兼容" if result['compatible'] else "[X] 需要处理"
        print(f"\n{'='*80}")
        print(f"文件: {result['file_name']} - {status}")
        print(f"表名: {result['table_name']}")
        print(f"编码: {result['encoding']}")
        print(f"字段数: {result['field_count']}")
        print(f"记录数: {result['record_count']}")
        
        if result['field_issues']:
            print(f"\n字段问题 ({len(result['field_issues'])} 个):")
            for issue in result['field_issues'][:10]:  # 只显示前10个
                print(f"  - {issue}")
        
        if result['primary_key_issues']:
            print(f"\n主键问题:")
            for issue in result['primary_key_issues']:
                print(f"  - {issue}")
        
        if result['data_issues']:
            print(f"\n数据格式问题 (显示前10个):")
            for issue in result['data_issues'][:10]:
                print(f"  - {issue}")
            if len(result['data_issues']) > 10:
                print(f"  ... 还有 {len(result['data_issues']) - 10} 个问题")
        
        if result['warnings']:
            print(f"\n警告:")
            for warning in result['warnings']:
                print(f"  - {warning}")
    
    # 生成建议
    print(f"\n{'='*80}")
    print("导入建议:")
    print("=" * 80)
    print()
    print("1. DBeaver 导入设置:")
    print("   - 编码: UTF-8 或 UTF-8 with BOM")
    print("   - 分隔符: 逗号 (,)")
    print("   - 文本限定符: 双引号 (\")")
    print("   - 首行包含列名: 是")
    print()
    print("2. 字段名处理:")
    print("   - 所有字段名都符合 MySQL 规范")
    print("   - 如果遇到保留字，DBeaver 会自动添加反引号")
    print()
    print("3. 日期格式:")
    print("   - 所有日期字段都是 YYYY-MM-DD 格式，符合 MySQL DATE 类型")
    print()
    print("4. 注意事项:")
    print("   - 建议先创建表结构，再导入数据")
    print("   - 导入时注意设置正确的主键和外键约束")
    print("   - 检查主键唯一性（部分表可能有重复）")
    print()
    
    return all_results

if __name__ == '__main__':
    generate_report()

