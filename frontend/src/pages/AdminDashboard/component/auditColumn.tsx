import type{ ColumnDef } from "@tanstack/react-table";



interface User{
    name:string;
    email:string;
}
export interface AuditLog{
    _id:string;
    action : string;
    createdAt:string;
    resource:string;
    author:User;


}
export const getColumns : ColumnDef<AuditLog>[] = [
  


 {
    accessorKey: "author.name",
    header: "User Name",
   
  },
   
    {
       accessorKey: "action",
       header:"Action"
    },
    // {
    //     accessorKey: "description",
    //    header:"Details"
    // },
     {
        accessorKey: "resource",
       header:"Source"
    },
    //  {
    //     accessorKey: "Time",
    //    header:"Total comments"
    // },

   



  
];
  
 

 



 