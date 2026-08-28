import type{ ColumnDef } from "@tanstack/react-table";
import type{ Blog } from "../../CreateEditBlog/api/createBlog.api";
import { Eye, Trash, Trash2 } from "lucide-react";


export const getColumns = ({
  onView,
  onDelete,
  onUserDelete
}: {
  onView: (blog: Blog ) => void;
  onDelete: (blog: Blog ) => void;
  onUserDelete:(userId:string, blog:Blog) =>void;
}): ColumnDef<Blog>[] => [
  


 {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const blog = row.original;

      return (
        <div className="flex justify-between">
          <span>{blog.title}</span>
         

          <button onClick={() => onDelete(blog)}>

            <Trash2 size={16} className=" text-red-500"/>
          </button>
        </div>
      );
    },
  },
   
    {
       accessorKey: "content",
       header:"Content"
    },
    {
        accessorKey: "Visibility",
       header:"Visibility"
    },
     {
        accessorKey: "totalLikes",
       header:"Total Likes"
    },
     {
        accessorKey: "totalComments",
       header:"Total comments"
    },

    {
    accessorKey: "author.name",
    header: "User",
    cell: ({ row }) => {
      const blog = row.original;

      return (
        <div className="flex justify-between">
          <span>{blog.author?.name}</span>
         

          <button onClick={() => onUserDelete(blog.author._id!,blog)}>
            <Trash2 size={16} className="text-red-500"/>
          </button>
        </div>
      );
    },
  },



  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const blog = row.original;

      return (
        <div className="flex gap-2">
          <button onClick={() => onView(blog)}>
            <Eye size={16}/>
          </button>

         
        </div>
      );
    },
  },
];
  
 

 



 