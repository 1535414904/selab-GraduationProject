#ifndef SA_H
#define SA_H

#include <vector>
#include "surgery.h"
#include "room.h"

void simulatedAnnealing(std::vector<Surgery> &surgeries, const std::vector<Room> &rooms, int cleaningTime);
std::string getCurrentDateTime();
void saveScheduleToCSV(const std::vector<Surgery> &schedule, const std::string &filename, const std::string &datetime);
void printScheduleSummary(const std::vector<Surgery> &schedule, const std::vector<Room> &rooms, int cleaningTime);

#endif
