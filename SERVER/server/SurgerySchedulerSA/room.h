#ifndef ROOM_H
#define ROOM_H

#include <string>

struct Room
{
    std::string name;
    int maxRegularTime;
    int maxOTTime;
    bool isSpecial;
};

#endif
