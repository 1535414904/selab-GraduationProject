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

// 檢查第一行是否為表頭
bool isHeaderLine(std::string line)
{
    // 移除 UTF-8 BOM
    if (line.size() >= 3 &&
        static_cast<unsigned char>(line[0]) == 0xEF &&
        static_cast<unsigned char>(line[1]) == 0xBB &&
        static_cast<unsigned char>(line[2]) == 0xBF)
    {
        line = line.substr(3);
    }

    if (!line.empty() && line[0] == '?')
        line.erase(0, 1);

    std::stringstream ss(line);
    std::string firstToken;
    if (!std::getline(ss, firstToken, ','))
        return true; // 空行視為表頭

    firstToken = trim(firstToken);
    if (firstToken.empty())
        return true;

    return !std::isdigit(static_cast<unsigned char>(firstToken[0]));
}

std::vector<Surgery> loadSurgeries(const std::string &filename)
{
    std::ifstream file(filename);
    std::vector<Surgery> result;
    std::string line;

    auto handleLine = [&](const std::string &ln)
    {
        std::stringstream ss(ln);
        std::vector<std::string> tokens;
        std::string token;

        while (std::getline(ss, token, ','))
            tokens.push_back(trim(token));

        // 新格式總共 10 欄
        if (tokens.size() < 10)
        {
            std::cerr << "[Skip] 欄位不足: " << ln << std::endl;
            return;
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
            return;
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
            std::cerr << "[Skip] 不合法手術資料: " << ln << std::endl;
            return;
        }

        result.push_back(s);
    };

    if (getline(file, line))
    {
        if (!isHeaderLine(line))
            handleLine(line);
    }

    while (getline(file, line))
    {
        handleLine(line);
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
    if (!file)
    {
        std::cerr << "[Error] 無法開啟檔案: " << filename << std::endl;
        return 0;
    }

    std::string line;
    int lineNumber = 0;

    while (std::getline(file, line))
    {
        std::string trimmed = trim(line);

        // 忽略註解或空行
        if (trimmed.empty() || trimmed[0] == '#')
            continue;

        ++lineNumber;

        if (lineNumber == 4)
        {
            try
            {
                return std::stoi(trimmed);
            }
            catch (...)
            {
                std::cerr << "[Error] 解析數值失敗: " << trimmed << std::endl;
                return 0;
            }
        }
    }

    std::cerr << "[Error] 找不到第 4 行資料於 " << filename << std::endl;
    return 0;
}
