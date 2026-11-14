
#ifndef EMERGENCY_MANAGER_H
#define EMERGENCY_MANAGER_H

#include "Emergency.h"
#include <queue>
#include <vector>

using namespace std;

class EmergencyManager {
private:
    priority_queue<Emergency*, vector<Emergency*>, EmergencyPriorityComparator> priorityQueue;
    int totalEmergencies;

public:
    EmergencyManager();

    void addEmergency(Emergency* emergency);
    Emergency* getHighestPriorityEmergency() const;
    Emergency* popHighestPriorityEmergency();

    bool hasEmergencies() const;
    int getTotalEmergencies() const;
    void displayAllPending() const;
};

#endif
