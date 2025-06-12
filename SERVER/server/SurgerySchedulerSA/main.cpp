#include <windows.h>
#include "io.h"
#include "sa.h"
#include <iostream>

extern void printScheduleSummary(const std::vector<Surgery> &, const std::vector<Room> &, int);
extern void saveScheduleToCSV(const std::vector<Surgery> &, const std::string &);

int main()
{
    SetConsoleOutputCP(CP_UTF8); // 支援中文輸出

    std::vector<Surgery> surgeries = loadSurgeries("TimeTable.csv");
    std::vector<Room> rooms = loadRooms("room.csv");
    int cleaningTime = loadCleaningTime("Arguments4Exec.csv");

    std::cout << "Loaded " << surgeries.size() << " surgeries.\n";

    std::cout << "\n🔹 模擬退火後分房排程結果:\n";
    printScheduleSummary(surgeries, rooms, cleaningTime);

    simulatedAnnealing(surgeries, rooms, cleaningTime); // 演算法內會印出最佳解

    std::cout << "\n🔹 模擬退火後排程（TimeTable.csv 格式）:\n";
    saveScheduleToCSV(surgeries, "SAresult.csv");

    return 0;
}
