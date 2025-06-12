#include "sa.h"
#include "evaluator.h"
#include <algorithm>
#include <random>
#include <iostream>
#include <fstream>
#include <iomanip>
#include <map>
#include <fstream>

std::vector<Surgery> generateNeighbor(const std::vector<Surgery> &current, const std::vector<Room> &rooms)
{
    auto neighbor = current;
    std::mt19937 rng(time(0));
    std::uniform_int_distribution<> dist(0, (int)neighbor.size() - 1);
    int i = dist(rng);

    // 隨機選一間不同房，換房 + 隨機插入位置
    std::vector<std::string> roomNames;
    for (const auto &r : rooms)
        roomNames.push_back(r.name);

    std::uniform_int_distribution<> rdist(0, (int)roomNames.size() - 1);
    std::string newRoom = roomNames[rdist(rng)];

    if (neighbor[i].specialRoomRequired)
    {
        // 若有特殊需求，挑一個 isSpecial = true 的房
        for (int tries = 0; tries < 5; ++tries)
        {
            newRoom = roomNames[rdist(rng)];
            auto it = std::find_if(rooms.begin(), rooms.end(), [&](const Room &r)
                                   { return r.name == newRoom && r.isSpecial; });
            if (it != rooms.end())
                break;
        }
    }

    neighbor[i].room = newRoom;

    // 隨機打亂同房手術順序（微調）
    std::shuffle(neighbor.begin(), neighbor.end(), rng);

    return neighbor;
}

void simulatedAnnealing(std::vector<Surgery> &surgeries, const std::vector<Room> &rooms, int cleaningTime)
{
    auto current = surgeries;
    auto best = current;
    double currentCost = evaluate(current, rooms, cleaningTime);
    double bestCost = currentCost;

    double T = 1000.0, cooling = 0.995;
    std::mt19937 rng(time(0));
    std::uniform_real_distribution<> prob(0.0, 1.0);

    while (T > 1e-2)
    {
        auto neighbor = generateNeighbor(current, rooms);
        double neighborCost = evaluate(neighbor, rooms, cleaningTime);

        if (neighborCost < currentCost || prob(rng) < exp((currentCost - neighborCost) / T))
        {
            current = neighbor;
            currentCost = neighborCost;
        }

        if (currentCost < bestCost)
        {
            best = current;
            bestCost = currentCost;
        }

        T *= cooling;
    }

    // 更新順序為每間房的排序（s.priority）
    std::map<std::string, int> roomCounter;
    for (auto &s : best)
    {
        s.priority = ++roomCounter[s.room];
    }

    surgeries = best;
    std::cout << "Best cost = " << bestCost << "\n";
}

void printScheduleSummary(const std::vector<Surgery> &schedule, const std::vector<Room> &rooms, int cleaningTime)
{
    std::map<std::string, std::vector<const Surgery *>> grouped;
    for (const auto &s : schedule)
        grouped[s.room].push_back(&s);

    for (const auto &r : rooms)
    {
        const std::string &roomName = r.name;
        int totalTime = 0;

        if (!grouped.count(roomName))
            continue;

        std::cout << roomName << " | ";

        for (const auto *s : grouped[roomName])
        {
            std::cout << s->applyId << "+" << s->duration << "  ";
            totalTime += s->duration + cleaningTime;
        }
        std::cout << "\n";

        int OT = std::max(0, totalTime - r.maxRegularTime);
        int over = std::max(0, totalTime - r.maxRegularTime - r.maxOTTime);
        if (over > 0)
            OT = r.maxOTTime;

        std::cout << roomName << " 總共使用 " << totalTime << " 分鐘，加班時間為 " << OT << " 分，超時時間為 " << over << " 分。\n\n";
    }
}

void saveScheduleToCSV(const std::vector<Surgery> &schedule, const std::string &filename)
{
    std::ofstream out(filename);
    if (!out)
    {
        std::cerr << "[Error] 無法寫入 " << filename << "\n";
        return;
    }

    // out << "日期時間資訊,申請序號,病歷號,科別名稱,主刀醫師名稱,最終手術房間名稱,麻醉方式,預估手術時長(分),特殊刀房需求(Y/N),優先刀序\n";

    for (const auto &s : schedule)
    {
        out << "2025-06-06 0830" << ","
            << s.applyId << ","
            << s.patientId << ","
            << s.department << ","
            << s.doctor << ","
            << s.room << ","
            << s.anesthesia << ","
            << s.duration << ","
            << (s.specialRoomRequired ? "Y" : "N") << ","
            << s.priority << "\n";
    }

    std::cout << "[OK] 模擬退火結果已輸出到 " << filename << "\n";
}