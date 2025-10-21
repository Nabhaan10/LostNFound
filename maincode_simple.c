#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "hashmapjose.c"
#include "queue.c"

int reportCounter = 1000;

void clearBuffer() {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

void getInput(char* buffer, int size, char* message) {
    printf("%s", message);
    fgets(buffer, size, stdin);
    
    // remove newline
    int len = strlen(buffer);
    if (len > 0 && buffer[len-1] == '\n') {
        buffer[len-1] = '\0';
    }

}

void reportLost() {
    char itemType[50];
    char description[100];
    char name[50];
    char phone[20];
    
    printf("\n--- Report Lost Item ---\n");
    
    getInput(itemType, 50, "Enter item type: ");
    getInput(description, 100, "Enter description: ");
    getInput(name, 50, "Enter your name: ");
    getInput(phone, 20, "Enter phone number: ");
    
    // add to hash table
    insertitem(itemType, description, name, phone);
    
    // add to queue
    Item* item = (Item*)malloc(sizeof(Item));
    item->type = 0;
    strcpy(item->itemName, itemType);
    strcpy(item->report, description);
    
    if (enqueue_lost(item)) {
        printf("\nItem reported successfully!\n");
        printf("Report ID: %d\n", reportCounter);
        reportCounter++;
        printf("Added to processing queue.\n");
    } else {
        printf("Error: Queue full!\n");
        free(item);
    }
    
    printf("\nSearching for matches...\n");
    search_item_type(itemType);
}

void reportFound() {
    char itemType[50];
    char description[100];
    char name[50];
    char phone[20];
    char foundDesc[120];
    
    printf("\n--- Report Found Item ---\n");
    
    getInput(itemType, 50, "Enter item type found: ");
    getInput(description, 100, "Enter description: ");
    getInput(name, 50, "Enter your name: ");
    getInput(phone, 20, "Enter phone number: ");
    
    // mark as found item
    strcpy(foundDesc, "FOUND_");
    strcat(foundDesc, description);
    
    insertitem(itemType, foundDesc, name, phone);
    
    Item* item = (Item*)malloc(sizeof(Item));
    item->type = 1;
    strcpy(item->itemName, itemType);
    strcpy(item->report, description);
    
    if (enqueue_found(item)) {
        printf("\nFound item reported!\n");
        printf("Report ID: %d\n", reportCounter);
        reportCounter++;
        
        printf("\nLost items that might match:\n");
        search_item_type(itemType);
        
        printf("\nContact owners directly if this matches!\n");
    } else {
        printf("Error: Queue full!\n");
        free(item);
    }
}

void searchByType() {
    char itemType[50];
    
    printf("\n--- Search Items ---\n");
    getInput(itemType, 50, "Enter item type: ");
    
    printf("\nSearching for %s items...\n", itemType);
    search_item_type(itemType);
}

void showAllItems() {
    printf("\n--- All Items ---\n");
    print_all_items();
}

void processQueue() {
    int choice;
    
    printf("\n--- Staff: Process Queue ---\n");
    printf("1. Process lost item\n");
    printf("2. Process found item\n");
    printf("3. View queue\n");
    printf("Enter choice: ");
    
    scanf("%d", &choice);
    clearBuffer();
    
    if (choice == 1) {
        Item* item = dequeue_lost();
        if (item) {
            printf("\nProcessing: %s\n", item->itemName);
            printf("Details: %s\n", item->report);
            printf("Done!\n");
            free(item);
        } else {
            printf("No lost items in queue\n");
        }
    } else if (choice == 2) {
        Item* item = dequeue_found();
        if (item) {
            printf("\nProcessing: %s\n", item->itemName);
            printf("Details: %s\n", item->report);
            printf("Done!\n");
            free(item);
        } else {
            printf("No found items in queue\n");
        }
    } else if (choice == 3) {
        printf("\nQueue status:\n");
        debug_print_queues();
    } else {
        printf("Invalid choice\n");
    }
}

void searchByDescription() {
    char keyword[50];
    
    printf("\n--- Search by Description ---\n");
    getInput(keyword, 50, "Enter keyword to search: ");
    
    printf("\nSearching for items with '%s' in description...\n", keyword);
    search_by_description(keyword);
}

void loadSampleData() {
    printf("Loading sample data...\n");
    
    insertitem("phone", "iPhone_12_blue_case", "John_Smith", "555-1234");
    insertitem("phone", "Samsung_Galaxy_black", "Sarah_Johnson", "555-5678");
    insertitem("wallet", "Brown_leather_wallet", "Mike_Chen", "555-9999");
    insertitem("keys", "Toyota_car_keys", "Lisa_Wong", "555-1111");
    
    insertitem("phone", "FOUND_iPhone_blue_case", "Emma_Davis", "555-3333");
    insertitem("wallet", "FOUND_Brown_wallet", "Tom_Wilson", "555-4444");
    
    printf("Sample data loaded!\n");
}

int main() {
    init_hashtable();
    
    printf("Lost and Found System\n");
    printf("System ready!\n\n");
    
    int choice;
    
    while (1) {
        printf("\n|==============================================|\n");
        printf("|           COLLEGE LOST & FOUND SYSTEM        |\n");
        printf("|==============================================|\n");
        printf("|  1. Report Lost Item                         |\n");
        printf("|  2. Report Found Item                        |\n");
        printf("|  3. Search Items by Type                     |\n");
        printf("|  4. Search Items by Description              |\n");
        printf("|  5. View All Items                           |\n");
        printf("|  6. Staff: Process Queue                     |\n");
        printf("|  7. Load Sample Data                         |\n");
        printf("|  8. Exit                                     |\n");
        printf("|==============================================|\n");
        printf("Enter choice: ");
        
        scanf("%d", &choice);
        clearBuffer();
        
        if (choice == 1) {
            reportLost();
        } else if (choice == 2) {
            reportFound();
        } else if (choice == 3) {
            searchByType();
        } else if (choice == 4) {
            searchByDescription();
        } else if (choice == 5) {
            showAllItems();
        } else if (choice == 6) {
            processQueue();
        } else if (choice == 7) {
            loadSampleData();
        } else if (choice == 8) {
            printf("Thank you!\n");
            return 0;
        } else {
            printf("Invalid choice\n");
        }
        
        printf("\nPress Enter...");
        getchar();
    }
    
    return 0;
}