import {
  Indexed,
  PrimaryKey,
  Type,
  parseType,
  readSchema,
  ArrayOf,
  Name,
} from "../src/index";

describe("test-readSchema", () => {
  class Friend {
    id = PrimaryKey(Number, { autoIncrement: true });
    name = Type(Name);
    age = Indexed(Number);
    tags = ArrayOf(Indexed(String));
    strArrWithDefault = ArrayOf(String, { default: ["foo", "bar", "3"] });
    cars = ArrayOf(Car);
    cats = ArrayOf({
      name: Type(String),
      age: Indexed(Number),
    });
    school = {
      name: Type(String),
      address: {
        city: Indexed(String, { compoundWith: () => this.school.name }),
      },
    };
  }

  class Car {
    name = Type(Name);
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
