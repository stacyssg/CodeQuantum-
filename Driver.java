import java.util.*;

public class Driver {

	private String[][] board = new String[7][7];
	private int[] columnValues = new int[7];
	
	public static void main(String[] args) {
		
		Scanner scnr = new Scanner(System.in);
		
		int playerChoice;
		
		System.out.println("Welcome to Connect 4!");
		while (isFour() == false)
		System.out.print("Chose which column to play your piece Player 1 (1-7): ");
		playerChoice = scnr.nextInt();

		board[columnValues[playerChoice]][playerChoice] = "P1";
		columnValues[playerChoice]++;

		System.out.print("Chose which column to play your piece Player 2 (1-7): ");
		playerChoice = scnr.nextInt();

		board[columnValues[playerChoice]][playerChoice] = "P2";
		columnValues[playerChoice]++;

	}
	
	public static boolean isFour() {
		if(
		return false;
	}

}
