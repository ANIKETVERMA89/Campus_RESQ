#include <iostream>
#include "include/ground.h"

using namespace std;

int main()
{
    CampusGraph campus;

    buildGroundFloor(campus);

    campus.displayGraph();

    return 0;
}