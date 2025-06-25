using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ATSScanner.Migrations
{
    /// <inheritdoc />
    public partial class AddUserResumeRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Resumes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Resumes_UserId",
                table: "Resumes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Resumes_Users_UserId",
                table: "Resumes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resumes_Users_UserId",
                table: "Resumes");

            migrationBuilder.DropIndex(
                name: "IX_Resumes_UserId",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Resumes");
        }
    }
}
