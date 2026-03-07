#This is a useful first draft before integrate database,only to understand the basic logic

import uuid

MIN_MATCH = 3

class User:
    def __init__(self, name, attributes):
        self.id = str(uuid.uuid4())
        self.name = name
        self.attributes = attributes
        self.group_id = None


class Group:
    def __init__(self, attributes):
        self.id = str(uuid.uuid4())
        self.matched_attributes = attributes
#databases
users_db = []
groups_db = []

#gruplama kısmı
def assign_group(new_user):
    for user in users_db:
        common_attrs = set(user.attributes) & set(new_user.attributes)

        if len(common_attrs) >= MIN_MATCH:
            new_user.group_id = user.group_id
            return

    # eşleşme yok → yeni group oluştur
    new_group = Group(new_user.attributes)
    groups_db.append(new_group)
    new_user.group_id = new_group.id

#yeni user ekleme fonksiyonu
def add_user(name, attributes):
    new_user = User(name, attributes)
    assign_group(new_user)
    users_db.append(new_user)
    return new_user
#test aşaması
u1 = add_user("Ali", ["Software", "Engineer", "Brussels", "Senior"])
u2 = add_user("Ayse", ["Software", "Engineer", "Gamer", "Senior"])
u3 = add_user("Mehmet", ["Doctor", "Istanbul", "Junior"])

for user in users_db:
    print(user.name, user.group_id)