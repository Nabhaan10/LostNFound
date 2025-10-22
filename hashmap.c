#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define SIZE 20

typedef struct Node{
    char item[50];        // item type (phone, wallet, etc.)
    char description[100]; // detailed description
    char reporterName[50]; // who reported it
    char phoneNumber[20];  // contact number
    struct Node* next;
}Node;

Node* hashtable[SIZE];

int hashfunc(char* key){
    int sum=0;
    for(int i=0;key[i]!='\0';i++){
        sum+=key[i];
    }
    return sum % SIZE;
}
void insertitem(char* item, char* description, char* reporterName, char* phoneNumber){
    int index=hashfunc(item);
    Node* newnode=(Node*)malloc(sizeof(Node));
    strcpy(newnode->item,item);
    strcpy(newnode->description,description);
    strcpy(newnode->reporterName,reporterName);
    strcpy(newnode->phoneNumber,phoneNumber);
    newnode->next=NULL;
    
    if (hashtable[index]==NULL){
        hashtable[index]=newnode;
    }
    else{
        Node* temp=hashtable[index];
        while(temp->next!=NULL){
            temp=temp->next;
        }
        temp->next=newnode;
    }
}

// SIMPLE VERSION: Just print all items in the hash table
void print_all_items() {
    printf("\nAll items in hash table:\n");
    for(int i = 0; i < SIZE; i++) {
        Node* current = hashtable[i];
        while(current != NULL) {
            printf("[Bucket %d] %s - %s\n", i, current->item, current->description);
            current = current->next;
        }
    }
}

// SIMPLE VERSION: Count total items in hash table
int count_all_items() {
    int count = 0;
    for(int i = 0; i < SIZE; i++) {
        Node* current = hashtable[i];
        while(current != NULL) {
            count++;
            current = current->next;
        }
    }
    return count;
}

// searches based on item type and displays the contact info of the reporter
void search_item_type(char* item) {
    int index = hashfunc(item);
    Node* current = hashtable[index];
    int found = 0;
    
    printf("\n=== %s ITEMS ===\n", item);
    while(current != NULL) {
        if(strcmp(current->item, item) == 0) {
            // Check if it's a found item (has FOUND_ prefix)
            int isFound = (strncmp(current->description, "FOUND_", 6) == 0);
            
            if (isFound) {
                printf("\n[FOUND ITEM]\n");
                printf("Description: %s\n", current->description + 6);
                printf("Found by: %s\n", current->reporterName);
            } else {
                printf("\n[LOST ITEM]\n");
                printf("Description: %s\n", current->description);
                printf("Lost by: %s\n", current->reporterName);
            }
            printf("Contact: %s\n", current->phoneNumber);
            printf("----------------------------------------\n");
            found = 1;
        }
        current = current->next;
    }
    
    if(!found) {
        printf("No %s items found.\n", item);
    }
}

// searches based on description keywords and displays matching items
void search_by_description(char* keyword) {
    printf("\nSearching for items with description containing '%s':\n", keyword);
    int found = 0;
    
    for(int i = 0; i < SIZE; i++) {
        Node* current = hashtable[i];
        while(current != NULL) {
            if(strstr(current->description, keyword) != NULL) {
                // Check if it's a found item
                int isFound = (strncmp(current->description, "FOUND_", 6) == 0);
                
                if (isFound) {
                    printf("\n[FOUND ITEM]\n");
                    printf("Item: %s\n", current->item);
                    printf("Description: %s\n", current->description + 6);
                    printf("Found by: %s\n", current->reporterName);
                } else {
                    printf("\n[LOST ITEM]\n");
                    printf("Item: %s\n", current->item);
                    printf("Description: %s\n", current->description);
                    printf("Lost by: %s\n", current->reporterName);
                }
                printf("Contact: %s\n", current->phoneNumber);
                printf("----------------------------------------\n");
                found = 1;
            }
            current = current->next;
        }
    }
    
    if(!found) {
        printf("  No items found with description containing '%s'\n", keyword);
    }
}

// Search for FOUND items only (items with FOUND_ prefix)
void search_found_items(char* item) {
    int index = hashfunc(item);
    Node* current = hashtable[index];
    int found = 0;
    
    printf("\n=== FOUND %s ITEMS ===\n", item);
    while(current != NULL) {
        if(strcmp(current->item, item) == 0 && strncmp(current->description, "FOUND_", 6) == 0) {
            // Display without the FOUND_ prefix
            printf("\nDescription: %s\n", current->description + 6);
            printf("Found by: %s\n", current->reporterName);
            printf("Contact: %s\n", current->phoneNumber);
            printf("----------------------------------------\n");
            found = 1;
        }
        current = current->next;
    }
    
    if(!found) {
        printf("No matching found %s items yet.\n", item);
    }
}

// Search for LOST items only (items WITHOUT FOUND_ prefix)
void search_lost_items(char* item) {
    int index = hashfunc(item);
    Node* current = hashtable[index];
    int found = 0;
    
    printf("\n=== LOST %s ITEMS ===\n", item);
    while(current != NULL) {
        if(strcmp(current->item, item) == 0 && strncmp(current->description, "FOUND_", 6) != 0) {
            printf("\nDescription: %s\n", current->description);
            printf("Lost by: %s\n", current->reporterName);
            printf("Contact: %s\n", current->phoneNumber);
            printf("----------------------------------------\n");
            found = 1;
        }
        current = current->next;
    }
    
    if(!found) {
        printf("No matching lost %s items yet.\n", item);
    }
}

// Initializing the hash table
void init_hashtable() {
    for(int i = 0; i < SIZE; i++) {
        hashtable[i] = NULL;
    }
}