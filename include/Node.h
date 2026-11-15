
#ifndef NODE_H
#define NODE_H

#include <string>
using namespace std;

class Node {
public:
    int id;
    string name;
    double risk;
    bool blocked;

    Node(int i, string n) {
        id = i;
        name = n;
        risk = 0;
        blocked = false;
    }
};

#endif
