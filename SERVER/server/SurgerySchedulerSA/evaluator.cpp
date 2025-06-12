#include "evaluator.h"
#include <unordered_map>
#include <map>

double evaluate(const std::vector<Surgery> &schedule, const std::vector<Room> &rooms, int cleaningTime)
{
    std::map<std::string, std::vector<const Surgery *>> grouped;
    for (const auto &s : schedule)
        grouped[s.room].push_back(&s);

    double totalPenalty = 0;

    for (const auto &r : rooms)
    {
        const std::string &roomName = r.name;
        int used = 0;
        if (grouped.count(roomName))
        {
            for (const auto *s : grouped[roomName])
                used += s->duration + cleaningTime;
        }

        int OT = std::max(0, used - r.maxRegularTime);
        int over = std::max(0, used - r.maxRegularTime - r.maxOTTime);
        if (over > 0)
            OT = r.maxOTTime;

        totalPenalty += OT + over * 10; // 可調整權重
    }

    return totalPenalty;
}
