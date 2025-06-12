#include "io.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <vector>
#include <algorithm> // for remove_if and isspace

// 工具函式：移除字串前後空白與換行
std::string trim(const std::string &s)
{
    size_t start = s.find_first_not_of(" \r\n\t");
    size_t end = s.find_last_not_of(" \r\n\t");
    return (start == std::string::npos || end == std::string::npos) ? "" : s.substr(start, end - start + 1);
}

std::vector<Surgery> loadSurgeries(const std::string &filename)
{
    std::ifstream file(filename);
    std::vector<Surgery> result;
    std::string line;
    getline(file, line); // skip header

    while (getline(file, line))
    {
        std::stringstream ss(line);
        std::vector<std::string> tokens;
        std::string token;

        while (std::getline(ss, token, ','))
        {
            tokens.push_back(trim(token));
        }

        // 新格式總共 10 欄
        if (tokens.size() < 10)
        {
            std::cerr << "[Skip] 欄位不足: " << line << std::endl;
            continue;
        }

        Surgery s;
        s.applyId = tokens[1];    // 申請序號
        s.patientId = tokens[2];  // 病歷號
        s.department = tokens[3]; // 科別名稱
        s.doctor = tokens[4];     // 主刀醫師名稱
        s.room = tokens[5];       // 初始手術房間名稱
        s.anesthesia = tokens[6]; // 麻醉方式
        s.specialRoomRequired = (tokens[8] == "Y");

        try
        {
            s.duration = std::stoi(tokens[7]); // 預估手術時長(分)
        }
        catch (...)
        {
            std::cerr << "[Error] 無法轉換手術時長: " << tokens[7] << std::endl;
            continue;
        }

        try
        {
            s.priority = std::stoi(tokens[9]); // 優先刀序
        }
        catch (...)
        {
            std::cerr << "[Error] 無法轉換優先序: " << tokens[9] << std::endl;
            s.priority = 9999;
        }

        s.id = s.room + "-" + std::to_string(s.priority);

        if (s.duration <= 0 || s.room.empty())
        {
            std::cerr << "[Skip] 不合法手術資料: " << line << std::endl;
            continue;
        }

        result.push_back(s);
    }

    return result;
}

std::vector<Room> loadRooms(const std::string &filename)
{
    std::ifstream file(filename);
    std::vector<Room> rooms;
    std::string line;
    getline(file, line); // skip header

    while (getline(file, line))
    {
        std::stringstream ss(line);
        Room r;
        std::string item;
        std::getline(ss, r.name, ',');
        std::getline(ss, item, ',');
        r.name = trim(r.name);
        r.isSpecial = (trim(item) == "special");
        r.maxRegularTime = 480;
        r.maxOTTime = 60;
        rooms.push_back(r);
    }
    return rooms;
}

int loadCleaningTime(const std::string &filename)
{
    std::ifstream file(filename);
    std::string line;
    getline(file, line); // skip header
    getline(file, line);
    std::stringstream ss(line);
    std::string item;
    for (int i = 0; i < 3; ++i)
        std::getline(ss, item, ',');
    std::getline(ss, item);
    return std::stoi(trim(item));
}
