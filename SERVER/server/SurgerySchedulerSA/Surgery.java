// File: Surgery.java
// 表示手術的類別
// 包含手術日期資訊、ID、病人ID、科別、主刀醫生、手術室ID、麻醉方式、持續時間、特殊手術房需求和順序等屬性
public class Surgery {
    public String surgeryDateTime;
    public String surgeryId;
    public String patientId;
    public String specialty;
    public String surgeon;
    public String roomId;
    public String anesthesia;
    public int duration;
    public String req;
    public int order;

    public Surgery(String surgeryDateTime, String surgeryId, String patientId, String specialty, String surgeon,
            String roomId, String anesthesia, int duration, String req, int order) {
        this.surgeryDateTime = surgeryDateTime; // 手術日期時間
        this.surgeryId = surgeryId; // 手術ID
        this.patientId = patientId; // 病人ID
        this.specialty = specialty; // 科別
        this.surgeon = surgeon; // 主刀醫生
        this.roomId = roomId; // 手術室ID
        this.anesthesia = anesthesia; // 麻醉方式
        this.duration = duration; // 持續時間（分鐘）
        this.req = req; // 特殊手術房需求
        this.order = order; // 排程順序
    }
}
