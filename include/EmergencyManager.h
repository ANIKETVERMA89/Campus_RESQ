#ifndef EMERGENCY_MANAGER_H
#define EMERGENCY_MANAGER_H

#include "Emergency.h"
#include <queue>
#include <vector>

class EmergencyManager {
private:
    std::priority_queue<Emergency*, std::vector<Emergency*>, EmergencyPriorityComparator> priorityQueue;
    int totalEmergencies;

public:
    EmergencyManager();
    ~EmergencyManager() = default;

    void addEmergency(Emergency* emergency);
    Emergency* getHighestPriorityEmergency() const;
    Emergency* popHighestPriorityEmergency();

    bool hasEmergencies() const;
    int getTotalEmergencies() const;
    void displayAllPending() const;
};

#endif // EMERGENCY_MANAGER_H