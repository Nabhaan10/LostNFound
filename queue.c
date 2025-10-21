#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int type;     // to identify if the item is lost or found(0 if lost, 1 if found)
    char itemName[50];
    char report[50];
} Item;

// Circular queues for lost and found items
#define Qsize 100
Item* lostqueue[Qsize];
int lostfront = 0, lostrear = 0;
Item* foundqueue[Qsize];
int foundfront = 0, foundrear = 0;

static int isEmpty(int front, int rear) {
    return front == rear;
}
static int isFull(int front, int rear) {
    return (rear + 1) % Qsize == front;
}

// Generic enqueue/dequeue helpers for circular buffer of pointers
static int enqueue(Item* q[], int* front, int* rear, Item* it) {
    if (isFull(*front, *rear)) return 0; // fail
    q[*rear] = it;
    *rear = (*rear + 1) % Qsize;
    return 1; // success
}

static Item* dequeue(Item* q[], int* front, int* rear) {
    if (isEmpty(*front, *rear)) return NULL;
    Item* it = q[*front];
    *front = (*front + 1) % Qsize;
    return it;
}

// Public queue APIs specific to lost/found queues
int enqueue_lost(Item* it) { 
    return enqueue(lostqueue, &lostfront, &lostrear, it);
}
Item* dequeue_lost(void) { 
    return dequeue(lostqueue, &lostfront, &lostrear); 
}
int enqueue_found(Item* it) { 
    return enqueue(foundqueue, &foundfront, &foundrear, it); 
}
Item* dequeue_found(void) {
    return dequeue(foundqueue, &foundfront, &foundrear); 
}

// Traversal over queues: visit each element in logical order from front to rear
void traverse_lost(void (*visit)(Item* it, void* ctx), void* ctx) {
    if (!visit) return;
    int i = lostfront;
    while (i != lostrear) {
        visit(lostqueue[i], ctx);
        i = (i + 1) % Qsize;
    }
}

void traverse_found(void (*visit)(Item* it, void* ctx), void* ctx) {
    if (!visit) return;
    int i = foundfront;
    while (i != foundrear) {
        visit(foundqueue[i], ctx);
        i = (i + 1) % Qsize;
    }
}

// Example printer for traversal
static void print_item(Item* it, void* ctx) {
    (void)ctx;
    if (!it) return;
    printf("type=%d, name=%s, report=%s\n", it->type, it->itemName, it->report);
}

void debug_print_queues(void) {
    printf("Lost queue (%s):\n", isEmpty(lostfront, lostrear) ? "empty" : "items");
    traverse_lost(print_item, NULL);
    printf("Found queue (%s):\n", isEmpty(foundfront, foundrear) ? "empty" : "items");
    traverse_found(print_item, NULL);
}

