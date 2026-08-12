import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CreateSearchModal from "./CreateSearchModal";
import { useCreateSearchConfig } from "../../hooks/useCreateSearch";

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock create search hook
vi.mock("../../hooks/useCreateSearch", () => ({
  useCreateSearchConfig: vi.fn(),
}));

describe("CreateSearchModal", () => {
  const mockSetIsOpen = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useCreateSearchConfig as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders dialog when isOpen is true", () => {
    render(
      <CreateSearchModal
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    expect(screen.getByText("Create Search")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/please input name/i)
    ).toBeInTheDocument();
  });

  it("does not render dialog when isOpen is false", () => {
    render(
      <CreateSearchModal
        isOpen={false}
        setIsOpen={mockSetIsOpen}
      />
    );

    expect(screen.queryByText("Create Search")).not.toBeInTheDocument();
  });

  it("updates the input value", () => {
    render(
      <CreateSearchModal
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    const input = screen.getByLabelText(
      /please input name/i
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: { value: "My Search" },
    });

    expect(input.value).toBe("My Search");
  });

  it("submits the form with correct payload", () => {
    render(
      <CreateSearchModal
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    fireEvent.change(screen.getByLabelText(/please input name/i), {
      target: { value: "Test Search" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(mockMutate).toHaveBeenCalledTimes(1);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it("does not submit when input is empty", () => {
    render(
      <CreateSearchModal
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockSetIsOpen).not.toHaveBeenCalled();
  });

  it("shows loading spinner and disables save button when pending", () => {
    (useCreateSearchConfig as any).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(
      <CreateSearchModal
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();

    expect(
      document.querySelector(".MuiCircularProgress-root")
    ).toBeInTheDocument();
  });
});