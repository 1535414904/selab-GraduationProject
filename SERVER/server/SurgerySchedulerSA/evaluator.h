#ifndef EVALUATOR_H
#define EVALUATOR_H

#include <vector>
#include "surgery.h"
#include "room.h"

double evaluate(const std::vector<Surgery> &solution, const std::vector<Room> &rooms, int cleaningTime);

#endif
