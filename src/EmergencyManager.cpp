
#include "../include/EmergencyManager.h"
#include <iostream>
using namespace std;

EmergencyManager::EmergencyManager() {
    totalEmergencies = 0;
}

void EmergencyManager::addEmergency(Emergency* emergency) {
    if (emergency != NULL) {
        priorityQueue.push(emergency);
        totalEmergencies++;
    }
}

Emergency* EmergencyManager::getHighestPriorityEmergency() const {
    if (priorityQueue.empty()) {
        return NULL;
    }
    return priorityQueue.top();
}

Emergency* EmergencyManager::popHighestPriorityEmergency() {
    if (priorityQueue.empty()) {
        return NULL;
    }

    Emergency* temp = priorityQueue.top();
    priorityQueue.pop();
    totalEmergencies--;

    return temp;
}

bool EmergencyManager::hasEmergencies() const {
    return !priorityQueue.empty();
}

int EmergencyManager::getTotalEmergencies() const {
    return totalEmergencies;
}


void EmergencyManager::displayAllPending() const {
    if (priorityQueue.empty()) {
        cout << "No pending emergencies." << endl;
        return;
    }

    priority_queue<Emergency*, vector<Emergency*>, EmergencyPriorityComparator> temp = priorityQueue;

    while (!temp.empty()) {
        temp.top()->display();
        temp.pop();
    }
}
