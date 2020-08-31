import { Indexed, PrimaryKey, Type } from "dreambase-types";
import { Dreambase } from "../src/index.js";

describe("Dreambase", () => {
  it("should be possible to use Dreambase", async () => {
    class Friend {
      id = PrimaryKey(String);
      name = Type(String);
      age = Indexed(Number);
    }

    const db = new Dreambase({
      friends: Friend,
    });

    const [id] = await db.friends.bulkAdd([{ id: "key", name: "Foo", age: 2 }]);
    expect(id).toBe("key");
    const friends = await db.friends.toArray();
    expect(friends).toBe([{ id: "key", name: "Foo", age: 2 }]);
  });
});
