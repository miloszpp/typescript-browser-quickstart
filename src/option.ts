import { Option, some, none, chain } from "fp-ts/lib/Option";
import { lookup, array } from "fp-ts/lib/Array";
import { IO, io } from "fp-ts/lib/IO";
import { log } from "fp-ts/lib/Console";

interface User {
  name: string;
  address: Option<Address>;
  meta: Record<string, string>;
}

interface Address {
  street: string;
  city: Option<string>;
}

class UserRepository {
  private users: User[] = [
    {
      name: "John",
      address: none,
      meta: { createdBy: "haxx0r" }
    },
    {
      name: "Anne",
      address: some({ street: "Warsaw", city: none }),
      meta: {
        createdBy: "admin55",
        modifiedBy: "johnz"
      }
    }
  ];

  getUser(id: number) {
    return lookup(id, this.users);
  }

  getCities() {
    const cities = this.users
      .map(user => user.address)
      .map(chain(address => address.city));
    return array.compact(cities);
  }

  forEachUser(action: (user: User) => IO<void>) {
    return array.sequence(io)(this.users.map(action));
  }
}

// Hint - use the following type classes:
// - Functor
// - Chain
// - Compactable

const repo = new UserRepository();
const logUsers = repo.forEachUser(log);

logUsers();

export default {};
