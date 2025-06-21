#include "io.h"
#include <iostream>

int main() {
    auto surgeries = loadSurgeries("TimeTable.csv");
    if (surgeries.empty()) {
        std::cerr << "no surgeries loaded\n";
        return 1;
    }
    std::cout << surgeries[0].applyId << " " << surgeries[0].room << "\n";
    return 0;
}
