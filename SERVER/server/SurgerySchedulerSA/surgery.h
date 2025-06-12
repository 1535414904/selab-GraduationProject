#ifndef SURGERY_H
#define SURGERY_H

#include <string>

struct Surgery
{
    std::string id;
    std::string room;
    int duration;
    bool specialRoomRequired;
    int priority;
    std::string applyId;    // 申請序號
    std::string patientId;  // 病歷號
    std::string department; // 科別名稱
    std::string doctor;     // 主刀醫師名稱
    std::string anesthesia; // 麻醉方式
};

#endif
