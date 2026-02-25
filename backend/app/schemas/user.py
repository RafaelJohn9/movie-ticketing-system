from pydantic import BaseModel, EmailStr, constr


class UserCreate(BaseModel):
    email: EmailStr
    phone_number: constr(min_length=10, max_length=15)
    full_name: constr(max_length=255)

class UserResponse(BaseModel):
    email: EmailStr
    phone_number: constr(min_length=10, max_length=15)
    full_name: constr(max_length=255)

    class Config:
        orm_mode = True
