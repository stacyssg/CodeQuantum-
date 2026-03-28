import java.util.*;

public class Driver {

	private static String[][] board = new String[7][7];
	private static int[] columnValues = new int[7];
	
	public static void main(String[] args) {
		
		Scanner scnr = new Scanner(System.in);
		
		int playerChoice = 1;
		
		System.out.println("Welcome to Connect 4!");
		while (isFour() == false) {
			System.out.print("Chose which column to play your piece Player 1 (1-7): ");
			do {
				if(playerChoice > 7|playerChoice < 1) {
					System.out.println("Out of Bounds: Please try again: ");
				}
				playerChoice = scnr.nextInt();
			}while(playerChoice > 7|playerChoice < 1); 

			board[columnValues[playerChoice-1]][playerChoice-1] = "P1";
			if(isFour()) {
				System.out.println("Congrats P1");
				break;
			}
			columnValues[playerChoice-1]++;
			
			//Display Board between each move

			System.out.print("Chose which column to play your piece Player 2 (1-7): ");
			do {
				if(playerChoice > 7|playerChoice < 1) {
					System.out.println("Out of Bounds: Please try again: ");
				}
				playerChoice = scnr.nextInt();
			}while(playerChoice > 7|playerChoice < 1); 

			board[columnValues[playerChoice-1]][playerChoice-1] = "P2";
			if(isFour()) {
				System.out.println("Congrats P2");
				break;
			}
			columnValues[playerChoice-1]++;
		}
		scnr.close();
	}
	
	public static boolean isFour() {
	    for (int row = 0; row < board.length; row++) {
	        for (int col = 0; col < board[0].length; col++) {
	            if (checkDirection(row, col, 0, 1) ||
	                checkDirection(row, col, 1, 0) ||
	                checkDirection(row, col, 1, 1) ||
	                checkDirection(row, col, 1, -1)) {
	                return true;
	            }
	        }
	    }
	    return false;
		
	}
	
	public static boolean checkDirection(int row, int col, int dRow, int dCol) {
	    String value = board[row][col];
	    if (value == null) return false;

	    for (int i = 1; i < 4; i++) {
	        int newRow = row + i * dRow;
	        int newCol = col + i * dCol;

	        if (newRow < 0 || newRow >= board.length ||
	            newCol < 0 || newCol >= board[0].length ||
	            !value.equals(board[newRow][newCol])) {
	            return false;
	        }
	    }
	    return true;
	}

}
