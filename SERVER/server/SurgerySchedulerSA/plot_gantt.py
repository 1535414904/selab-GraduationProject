import pandas as pd
import matplotlib.pyplot as plt
import matplotlib


# ✅ 加入這行：設定字體為支援中文的字型
plt.rcParams['font.family'] = 'Microsoft JhengHei'  # 或 'Arial Unicode MS', 'SimHei' 等
COLUMN_NAMES = [
    "日期時間資訊", "申請序號", "病歷號", "科別名稱", "主刀醫師名稱",
    "初始手術房間名稱", "麻醉方式", "預估手術時長(分)", "特殊刀房需求(Y/N)", "優先刀序"
]

def load_and_group(csv_path):
    df = pd.read_csv(csv_path, header=None, names=COLUMN_NAMES)

    possible_columns = ['最終手術房間名稱', '初始手術房間名稱', '手術房', '房號']
    for col in possible_columns:
        if col in df.columns:
            df['房間'] = df[col]
            break
    else:
        # fallback: 使用初始手術房間名稱
        df['房間'] = df['初始手術房間名稱']

    df = df.sort_values(by=['房間', '優先刀序'])
    return df.groupby('房間')

def plot_gantt(groups, title, ax):
    colors = plt.cm.tab20.colors
    color_map = {}
    color_index = 0

    for idx, (room, group) in enumerate(groups):
        start_time = 0
        for _, row in group.iterrows():
            label = f"{row['申請序號']}"
            duration = int(row['預估手術時長(分)'])
            color = color_map.setdefault(label, colors[color_index % len(colors)])
            color_index += 1

            ax.barh(y=room, width=duration, left=start_time, color=color, edgecolor='black')
            ax.text(start_time + duration / 2, room, label, ha='center', va='center', fontsize=8)
            start_time += duration + 10  # 加上清潔時間

    ax.set_xlabel('時間 (分鐘)')
    ax.set_title(title)
    ax.grid(True)

def main():
    fig, axs = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

    groups1 = load_and_group('TimeTable.csv')
    groups2 = load_and_group('SAresult.csv')

    plot_gantt(groups1, '初始排程 (TimeTable)', axs[0])
    plot_gantt(groups2, '模擬退火後排程 (SAresult)', axs[1])

    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
