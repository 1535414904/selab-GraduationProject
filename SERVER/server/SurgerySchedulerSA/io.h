#ifndef IO_H
#define IO_H

#include <vector>
#include <string>
#include "surgery.h"
#include "room.h"

std::vector<Surgery> loadSurgeries(const std::string &filename);
std::vector<Room> loadRooms(const std::string &filename);
int loadCleaningTime(const std::string &filename);

#endif
