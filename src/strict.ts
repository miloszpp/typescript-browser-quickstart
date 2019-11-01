// 0. Make sure `strict` compiler flag is disabled.
// 1. Try to find as many potential runtime issues as possible.
// 2. Try to think which lines will turn red after enabling the `strict` flag.
// 3. Enable the `strict` flag and fix the errors.
// 4. Double check whether some runtime errors are still possible.

interface Address {
  street: string;
  city?: string;
}

interface User {
  name: string;
  address: Address;
  meta: Record<string, string>;
}

interface SuperUser extends User {
  permissions: string[];
}

class UserRepository {
  private users: User[];

  init() {
    this.users = [
      // Do not change the data. Let's assume it comes from the backend.
      {
        name: "John",
        address: undefined,
        meta: { createdBy: "haxx0r" }
      },
      {
        name: "Anne",
        address: { street: "Warsaw" },
        meta: {
          createdBy: "admin55",
          modifiedBy: "johnz"
        }
      }
    ];
  }

  getUser(id) {
    return this.users[id];
  }

  getCities() {
    return this.users
      .filter(user => user.address.city)
      .map(user => user.address.city);
  }

  forEachUser(action: (user: User) => void) {
    this.users.forEach(user => action(user));
  }
}

const userRepository = new UserRepository();

console.log(userRepository.getUser(1).address.city.toLowerCase());

console.log(
  userRepository
    .getCities()
    .map(city => city.toUpperCase())
    .join(", ")
);

console.log(new Date(userRepository.getUser(1).meta.modfiedBy).getFullYear());

userRepository.forEachUser((user: SuperUser) =>
  console.log(user.permissions.join(", "))
);

export default {};
