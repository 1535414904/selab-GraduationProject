#ifndef SA_H
#define SA_H

#include <vector>
#include "surgery.h"
#include "room.h"

void simulatedAnnealing(std::vector<Surgery> &surgeries, const std::vector<Room> &rooms, int cleaningTime);

#endif
