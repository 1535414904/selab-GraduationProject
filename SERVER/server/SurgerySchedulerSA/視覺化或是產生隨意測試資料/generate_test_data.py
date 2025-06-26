import csv
import random
import string

# --- 可調整的設定 ---

# 基本設定
TOTAL_ROOMS = 10          # 要生成的總手術房數量
NUM_SPECIAL_ROOMS = 3     # 在總手術房中，有多少間是特殊手術房
NUM_SURGERIES = 50        # 要生成的總手術數量
PERCENT_SPECIAL_REQ = 0.2   # 有多少比例的手術需要特殊手術房 (req='Y')

# 手術屬性選項 (可自行增加)
SPECIALTIES = ["一般科", "內科", "泌尿科", "骨科", "心臟科", "神經科"]
SURGEONS = [
    "陳俊傑", "賴依潔", "林宏宇", "張哲偉", "沈若曦", "陳立伊",
    "吳昊然", "楊柔安", "王柏翰", "賴志豪", "徐昱翔", "趙立軒"
]
ANESTHESIA_TYPES = ["GA", "SA", "LA"]

# --- 程式碼主體 ---

def generate_room_ids(count):
    """生成手術房的唯一ID，例如：A1, A2... B1, B2..."""
    ids = []
    for i in range(count):
        letter = string.ascii_uppercase[i // 9] if i // 9 < 26 else 'X'
        number = (i % 9) + 1
        ids.append(f"{letter}{number}")
    return ids

def create_room_csv(filename="data\\in\\room.csv"):
    """
    生成 room.csv 檔案，並返回所有房間ID和特殊房間ID。
    """
    if NUM_SPECIAL_ROOMS > TOTAL_ROOMS:
        print("錯誤：特殊手術房數量不能大於總手術房數量。")
        return None, None

    all_room_ids = generate_room_ids(TOTAL_ROOMS)
    special_room_ids = random.sample(all_room_ids, NUM_SPECIAL_ROOMS)

    try:
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            f.write("# roomNamesOfAll\n")
            f.write(f'"{",".join(all_room_ids)}"\n')
            f.write("# roomNames4Orth\n")
            f.write(f'"{",".join(special_room_ids)}"\n')
        print(f"✅ 成功生成 {filename}")
        print(f"   - 總手術房 ({TOTAL_ROOMS} 間): {', '.join(all_room_ids)}")
        print(f"   - 特殊手術房 ({NUM_SPECIAL_ROOMS} 間): {', '.join(special_room_ids)}")
        return all_room_ids, special_room_ids
    except IOError as e:
        print(f"❌ 生成 {filename} 失敗: {e}")
        return None, None


def create_timetable_csv(filename="data\\in\\TimeTable.csv", all_rooms=None, special_rooms=None):
    """
    生成 TimeTable.csv 檔案，並預先分配好手術房。
    """
    if not all_rooms:
        print("❌ 生成 TimeTable.csv 失敗: 未提供手術房列表。")
        return

    headers = [
        "surgeryDateTime", "surgeryId", "patientId", "specialty",
        "surgeon", "roomId", "anesthesia", "duration", "req", "order"
    ]
    
    surgeries = []
    num_special_surgeries = int(NUM_SURGERIES * PERCENT_SPECIAL_REQ)

    # 如果沒有設定特殊房，但卻有特殊需求的手術，這是不合理的狀況
    if num_special_surgeries > 0 and not special_rooms:
        print("⚠️ 警告：有手術需要特殊房(req='Y')，但系統中未設定任何特殊手術房。將無法正確分配。")

    for i in range(NUM_SURGERIES):
        is_special_req = 'Y' if i < num_special_surgeries else 'N'
        
        # --- 核心分配邏輯 ---
        assigned_room = ""
        if is_special_req == 'Y':
            # 如果是特殊需求，必須從特殊手術房中選一間
            if special_rooms:
                assigned_room = random.choice(special_rooms)
            else:
                # 預防萬一，如果沒有特殊房但又有特殊需求，只好隨便給一間
                assigned_room = random.choice(all_rooms)
        else:
            # 如果是普通手術，從所有手術房中隨機選一間
            assigned_room = random.choice(all_rooms)
        
        surgery = {
            "surgeryDateTime": "2025-06-06 TF",
            "surgeryId": f"{11101 + i}",
            "patientId": f"{10001 + i:05d}",
            "specialty": random.choice(SPECIALTIES),
            "surgeon": random.choice(SURGEONS),
            "roomId": assigned_room, # << 預先分配好的房間ID
            "anesthesia": random.choice(ANESTHESIA_TYPES),
            "duration": random.randint(30, 300),
            "req": is_special_req,
            "order": i + 1
        }
        surgeries.append(surgery)

    random.shuffle(surgeries)

    try:
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            # 您的範例沒有標頭，所以我們直接寫入資料
            writer = csv.writer(f)
            for s in surgeries:
                writer.writerow(s.values())

        print(f"✅ 成功生成 {filename} (已預先分配手術房)")
        print(f"   - 總手術數量: {NUM_SURGERIES}")
        print(f"   - 特殊需求手術 (req='Y'): {num_special_surgeries} 筆 (已確保分配至特殊房)")
    except IOError as e:
        print(f"❌ 生成 {filename} 失敗: {e}")


if __name__ == "__main__":
    print("==============================================")
    print("    手術排程測試資料自動生成器 (含預分配)")
    print("==============================================")
    print(f"設定: {TOTAL_ROOMS} 間手術房 ({NUM_SPECIAL_ROOMS} 間特殊), {NUM_SURGERIES} 筆手術\n")
    
    # 1. 生成手術房設定檔，並取得房間列表
    all_room_ids, special_room_ids = create_room_csv()
    
    print("-" * 46)

    # 2. 生成手術資料表，並傳入房間列表進行預分配
    if all_room_ids:
        create_timetable_csv(all_rooms=all_room_ids, special_rooms=special_room_ids)
    
    print("\n測試資料已生成！現在 TimeTable.csv 中已包含預分配的手術房。")
    print("==============================================")