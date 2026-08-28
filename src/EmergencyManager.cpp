#include "../include/EmergencyManager.h"
#include <iostream>

EmergencyManager::EmergencyManager() : totalEmergencies(0) {}

void EmergencyManager::addEmergency(Emergency* emergency) {
    if (emergency != nullptr) {
        priorityQueue.push(emergency);
        totalEmergencies++;
    }
}

Emergency* EmergencyManager::getHighestPriorityEmergency() const {
    if (priorityQueue.empty()) {
        return nullptr;
    }
    return priorityQueue.top();
}

Emergency* EmergencyManager::popHighestPriorityEmergency() {
    if (priorityQueue.empty()) {
        return nullptr;
    }
    Emergency* top = priorityQueue.top();
    priorityQueue.pop();
    totalEmergencies--;
    return top;
}

bool EmergencyManager::hasEmergencies() const {
    return !priorityQueue.empty();
}

int EmergencyManager::getTotalEmergencies() const {
    return totalEmergencies;
}

void EmergencyManager::displayAllPending() const {
    if (priorityQueue.empty()) {
        std::cout << "No pending emergencies.\n";
        return;
    }
    
    auto tempQueue = priorityQueue;
    std::cout << "\n--- Current Pending Emergencies (Priority Order) ---\n";
    while (!tempQueue.empty()) {
        tempQueue.top()->display();
        tempQueue.pop();
    }
    std::cout << "---------------------------------------------------\n";
}