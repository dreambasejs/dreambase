import { Indexed, PrimaryKey, Type, parseType, readSchema } from "../src/index";

describe("test-readSchema", () => {
  class Friend {
    id = PrimaryKey(Number, { autoIncrement: true });
    name = Type(String);
    age = Indexed(Number);
    school = {
      name: Type(String),
      address: {
        city: Indexed(String, { compoundWith: () => this.school.name }),
      },
    };
  }

  class Car {
    name = Type(String);
    date = Type(Date);
  }

  it("Friend should match snapshot", () => {
    const friendType = readSchema(Friend);
    expect(friendType).toMatchSnapshot();
  });

  it("Car should match snapshot", () => {
    const friendType = readSchema(Car);
    expect(friendType).toMatchSnapshot();
  });
});
