#include <iostream>
#include <vector>
#include <cmath>
#include "../include/Route.h"
#include "../include/RouteCost.h"

static int failures = 0;
#define CHECK(cond) do { if (!(cond)) { std::cout << "FAIL: " #cond << std::endl; ++failures; } } while (0)

int main() {
    RouteCost rc; // 1.0, 2.0, 1.5
    CHECK(std::fabs(rc.calculate(10, 1, 2) - (10 + 2 + 3)) < 1e-9);
    CHECK(RouteCost::isBlockedCost(rc.calculate(10, 1, 2, true)));
    CHECK(std::fabs(rc.calculate(10, 1, 2, false) - 15.0) < 1e-9);

    // emergency mode: risk matters much more
    rc.setWeights(1.0, 5.0, 1.5);
    CHECK(std::fabs(rc.calculate(10, 1, 2) - 18.0) < 1e-9);
    rc.setWeights(-1, 0, 0); // ignored
    CHECK(rc.getBeta() == 5.0);

    // decimals must survive (the old int bug)
    rc.setWeights(0.5, 0.5, 0.5);
    CHECK(std::fabs(rc.calculate(2, 2, 2) - 3.0) < 1e-9);

    // Route comparison
    Route a(0, 3, std::vector<int>{0, 1, 3}, 10, 1, 1, 12);
    Route b(0, 3, std::vector<int>{0, 2, 3}, 12, 0, 0, 12.5);
    CHECK(a < b);
    CHECK(!(b < a));
    CHECK(a.getPath().size() == 3);
    Route d;
    CHECK(d.getSource() == -1);

    a.displayRoute();
    std::cout << (failures == 0 ? "ALL TESTS PASSED" : "SOME TESTS FAILED") << std::endl;
    return failures;
}
