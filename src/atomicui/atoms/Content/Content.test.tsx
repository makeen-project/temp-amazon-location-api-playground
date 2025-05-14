import { render, screen } from "@testing-library/react";

import Content from "./Content";

describe("<Content />", () => {
	describe("text type", () => {
		it("renders text items correctly", () => {
			const items = [{ text: "First text" }, { text: "Second text" }];

			render(<Content items={items} />);

			expect(screen.getByText("First text")).toBeInTheDocument();
			expect(screen.getByText("Second text")).toBeInTheDocument();
		});
	});

	describe("list type", () => {
		it("renders list items correctly", () => {
			const items = [{ text: "First item" }, { text: "Second item" }];

			render(<Content items={items} type="list" />);

			const listItems = screen.getAllByRole("listitem");
			expect(listItems).toHaveLength(2);
			expect(listItems[0]).toHaveTextContent("First item");
			expect(listItems[1]).toHaveTextContent("Second item");
		});
	});
});
