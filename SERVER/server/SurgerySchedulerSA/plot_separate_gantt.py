import pandas as pd
import matplotlib.pyplot as plt
import matplotlib

# 中文顯示設定
matplotlib.rcParams['font.family'] = 'Microsoft JhengHei'
matplotlib.rcParams['axes.unicode_minus'] = False

# 載入排程參數
def load_exec_params(path="Arguments4Exec.csv"):
    encodings = ["utf-8-sig", "cp950", "big5", "utf-8"]
    for enc in encodings:
        try:
            df = pd.read_csv(path, encoding=enc, header=None)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValueError("無法解碼 Arguments4Exec.csv")

    values = df.iloc[1::2, 0].astype(int).tolist()
    return {
        "start_time": values[0],
        "max_regular": values[1],
        "max_overtime": values[2],
        "cleaning_time": values[3],
    }

PARAMS = load_exec_params()

def load_schedule(path):
    # 標準欄位名稱，無論是否有標題列都強制對應
    columns = [
        "surgeryDateTime", "surgeryId", "patientId", "specialty", "surgeon",
        "roomId", "anesthesia", "duration", "req", "order"
    ]

    try:
        with open(path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
    except FileNotFoundError:
        print(f"錯誤：找不到檔案 {path}")
        return pd.DataFrame(columns=columns) # 返回一個空的DataFrame

    # --- ✨ 修正點在這裡 ---
    # 判斷標題列的邏輯更嚴謹，只有當第一行明確包含 'surgeryDateTime' 才視為有標題
    has_header = "surgeryDateTime" in first_line

    print(f"檔案 {path} {'有' if has_header else '無'}標題列 (已修正判斷邏輯)")
    
    # 根據是否有標題來讀取CSV
    # 由於我們的 TimeTable.csv 沒有標頭，所以總是從第一行開始讀取資料
    # pandas 在 header=None 時會自動從第一行讀取
    df = pd.read_csv(path, header=0 if has_header else None, names=columns)

    # 資料型別處理
    df["duration"] = pd.to_numeric(df["duration"], errors='coerce').fillna(0).astype(int)
    df["order"] = pd.to_numeric(df["order"], errors='coerce').fillna(0).astype(int)
    
    # 確保 roomId 是字串型別，避免後續處理錯誤
    if 'roomId' in df.columns:
        df['roomId'] = df['roomId'].astype(str)

    df["start"] = 0
    df["end"] = 0

    # 排序後依房號與順序安排手術時間
    df = df.sort_values(by=["roomId", "order"]).reset_index(drop=True)
    for room in df['roomId'].dropna().unique():
        current_time = 0
        for idx in df[df['roomId'] == room].index:
            df.loc[idx, 'start'] = current_time
            df.loc[idx, 'end'] = current_time + df.loc[idx, 'duration']
            current_time = df.loc[idx, 'end'] + PARAMS["cleaning_time"]

    return df


def classify_by_end(end_time):
    base = PARAMS["start_time"]
    reg_limit = base + PARAMS["max_regular"]
    ot_limit = reg_limit + PARAMS["max_overtime"]
    if end_time <= reg_limit:
        return "regular"
    elif end_time <= ot_limit:
        return "overtime"
    else:
        return "overdue"

def classify_and_plot(ax, df, room_pos, offset, label_prefix, colors, cleaning_color):
    if not room_pos: # 如果沒有房間，直接返回
        return
        
    first_room = list(room_pos.keys())[0]
    for _, row in df.iterrows():
        # 檢查 roomId 是否有效
        if pd.isna(row["roomId"]) or row["roomId"] not in room_pos:
            continue
        if row["duration"] <= 0:
            continue

        y = room_pos[row["roomId"]] + offset
        start = row["start"] + PARAMS["start_time"]
        end = row["end"] + PARAMS["start_time"]
        color_key = classify_by_end(end)
        
        # 為了讓圖例不重複，只在第一個房間的第一個同類型手術上加標籤
        # label_key = f"{label_prefix}-{color_key}"
        # if not hasattr(ax, '_used_labels'):
        #     ax._used_labels = set()
        
        # label_to_show = ""
        # if label_key not in ax._used_labels:
        #     label_to_show = f"{label_prefix}：{color_key}"
        #     ax._used_labels.add(label_key)

        # 畫手術區塊
        ax.barh(y, end - start, left=start, color=colors[color_key], edgecolor="black", height=0.8)

        # 顯示文字：重疊在區塊上
        text = ""
        if "surgeryId" in row and "surgeon" in row:
            text = f"{row['surgeryId']} / {row['surgeon']}"
        elif "surgeon" in row:
            text = f"{row['surgeon']}"
        elif "surgeryId" in row:
            text = f"{row['surgeryId']}"
        if text:
            ax.text((start + end) / 2, y,
                    text, ha='center', va='center',
                    fontsize=10, color='black', clip_on=True)

        # 清消區塊
        # clean_label_key = f"{label_prefix}-clean"
        # clean_label_to_show = ""
        # if clean_label_key not in ax._used_labels:
        #     clean_label_to_show = f"{label_prefix}：清消"
        #     ax._used_labels.add(clean_label_key)

        ax.barh(y, PARAMS["cleaning_time"], left=end, color=cleaning_color, edgecolor="black", height=0.8)


def plot_stacked_gantt(df_old, df_new):
    fig, axes = plt.subplots(2, 1, figsize=(20, 14), sharex=True)

    all_rooms = sorted(set(df_old['roomId'].dropna().astype(str)) | set(df_new['roomId'].dropna().astype(str)))
    room_pos = {room: i for i, room in enumerate(all_rooms)}

    # # 清除舊的標籤紀錄
    # for ax in axes:
    #     if hasattr(ax, '_used_labels'):
    #         del ax._used_labels

    # 上：原始排程
    classify_and_plot(axes[0], df_old, room_pos, 0, "原始", {
    #     "regular": "#6aa84f",
    #     "overtime": "#ffd966",
    #     "overdue": "#cc0000"
    # }, cleaning_color="#3c78d8")
       "regular": "#93c47d",
       "overtime": "#f6b26b",
       "overdue": "#e06666"
    }, cleaning_color="#9fc5e8")
    axes[0].set_yticks([room_pos[r] for r in all_rooms])
    axes[0].set_yticklabels(all_rooms, fontsize=12)
    axes[0].set_title("原始手術排程", fontsize=16)
    axes[0].grid(axis='x', linestyle='--', alpha=0.6)

    # 下：模擬退火後
    classify_and_plot(axes[1], df_new, room_pos, 0, "退火後", {
       "regular": "#93c47d",
       "overtime": "#f6b26b",
       "overdue": "#e06666"
    }, cleaning_color="#9fc5e8")
    axes[1].set_yticks([room_pos[r] for r in all_rooms])
    axes[1].set_yticklabels(all_rooms, fontsize=12)
    axes[1].set_title("模擬退火後手術排程", fontsize=16)
    axes[1].set_xlabel("時間（分鐘，自午夜起）", fontsize=14)
    axes[1].grid(axis='x', linestyle='--', alpha=0.6)

    # 整合並顯示圖例
    # handles, labels = [], []
    # for ax in axes:
    #     h, l = ax.get_legend_handles_labels()
    #     for i, label in enumerate(l):
    #         if label not in labels:
    #             labels.append(label)
    #             handles.append(h[i])

    # fig.legend(handles, labels, loc='upper center', bbox_to_anchor=(0.5, 1.0), ncol=5, fontsize=12)
    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.show()

if __name__ == "__main__":
    old_df = load_schedule("TimeTable.csv")
    new_df = load_schedule("newTimeTable.csv")
    
    if not old_df.empty and not new_df.empty:
        plot_stacked_gantt(old_df, new_df)
    else:
        print("一個或多個排程檔案為空或讀取失敗，無法生成圖表。")